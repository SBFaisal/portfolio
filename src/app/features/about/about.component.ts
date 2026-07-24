import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { map, take } from 'rxjs';
import { PortfolioDataService } from '../../core/data/portfolio-data.service';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading.component';
import { AboutQuickStat } from '../../core/models/portfolio-data.model';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [SectionHeadingComponent, AsyncPipe],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit, OnDestroy {
  private readonly portfolioDataService = inject(PortfolioDataService);
  private readonly platformId = inject(PLATFORM_ID);

  private animationFrameId: number | null = null;
  private animationStart = 0;
  private counterTargets: number[] = [];
  private timelineSectionElement: HTMLElement | null = null;
  private timelineItemElements: HTMLElement[] = [];

  counterValues: number[] = [];
  timelineProgress = 0;
  timelineItemStates: boolean[] = [];

  readonly vm$ = this.portfolioDataService.data$.pipe(
    map((data) => ({
      name: data.personalDetails.name,
      about: data.about,
      experience: data.experience,
      technologies: data.technologies,
      skillBadges: data.technologies.groups.flatMap((group) => group.items.map((item) => item.name))
    }))
  );

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Ensure the viewport is anchored at the left edge.
    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
    window.scrollTo({
      left: 0,
      top: window.scrollY,
      behavior: 'auto'
    });

    this.vm$.pipe(take(1)).subscribe((vm) => {
      this.counterTargets = vm.about.quickStats.map((stat) => (this.isNumeric(stat.value) ? stat.value : 0));
      this.counterValues = this.counterTargets.map(() => 0);
      this.timelineItemStates = vm.experience.items.map(() => false);
      this.startCounters();

      requestAnimationFrame(() => {
        this.initializeTimelineAnimations();
      });
    });
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.handleTimelineViewportChange);
      window.removeEventListener('resize', this.handleTimelineViewportChange);
    }
  }

  isNumeric(value: number | string): value is number {
    return typeof value === 'number';
  }

  getStatValue(stat: AboutQuickStat, index: number): string {
    if (this.isNumeric(stat.value)) {
      return `${this.counterValues[index] ?? 0}${stat.suffix ?? ''}`;
    }

    return stat.value;
  }

  private startCounters(): void {
    const duration = 1500;
    const step = (timestamp: number): void => {
      if (this.animationStart === 0) {
        this.animationStart = timestamp;
      }

      const elapsed = timestamp - this.animationStart;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);

      this.counterValues = this.counterTargets.map((target) => Math.round(target * eased));

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(step);
        return;
      }

      this.animationFrameId = null;
    };

    this.animationFrameId = requestAnimationFrame(step);
  }

  private initializeTimelineAnimations(): void {
    this.timelineSectionElement = document.querySelector('.experience-timeline');
    this.timelineItemElements = Array.from(document.querySelectorAll('.timeline-item'));

    if (!this.timelineSectionElement || !this.timelineItemElements.length) {
      return;
    }

    this.updateTimelineAnimationState();
    window.addEventListener('scroll', this.handleTimelineViewportChange, { passive: true });
    window.addEventListener('resize', this.handleTimelineViewportChange);
  }

  private readonly handleTimelineViewportChange = (): void => {
    this.updateTimelineAnimationState();
  };

  private updateTimelineAnimationState(): void {
    if (!this.timelineSectionElement || !this.timelineItemElements.length) {
      return;
    }

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const entryStart = viewportHeight * 0.9;
    const exitEnd = viewportHeight * 0.18;

    this.timelineItemStates = this.timelineItemElements.map((element) => {
      const rect = element.getBoundingClientRect();
      return rect.top < entryStart && rect.bottom > exitEnd;
    });

    const timelineRect = this.timelineSectionElement.getBoundingClientRect();
    const startOffset = viewportHeight * 0.78;
    const endOffset = viewportHeight * 0.2;
    const total = timelineRect.height + (startOffset - endOffset);
    const rawProgress = (startOffset - timelineRect.top) / Math.max(total, 1);

    this.timelineProgress = Math.min(1, Math.max(0, rawProgress));
  }
}
