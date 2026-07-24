import { AsyncPipe, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, OnDestroy, inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { map } from 'rxjs';
import { PortfolioDataService } from '../../core/data/portfolio-data.service';
import { ProjectItem } from '../../core/models/portfolio-data.model';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [SectionHeadingComponent, AsyncPipe],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnDestroy {
  private readonly portfolioDataService = inject(PortfolioDataService);
  private readonly platformId = inject(PLATFORM_ID);

  searchTerm = '';
  activeTechnology = 'All';
  selectedProject: ProjectItem | null = null;
  private activeCardRect: DOMRect | null = null;

  ngOnDestroy(): void {
    if (this.isBrowser()) {
      document.body.style.overflow = '';
    }
  }

  readonly vm$ = this.portfolioDataService.data$.pipe(
    map((data) => {
      const projects = data.projects;
      const technologies = new Set<string>();

      for (const project of projects.items) {
        for (const tech of project.stack) {
          technologies.add(tech);
        }
      }

      return {
        ...projects,
        technologies: ['All', ...Array.from(technologies).sort((a, b) => a.localeCompare(b))]
      };
    })
  );

  setActiveTechnology(technology: string): void {
    this.activeTechnology = technology;
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.searchTerm = input?.value ?? '';
  }

  getFilteredProjects(projects: ProjectItem[]): ProjectItem[] {
    const term = this.searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      const technologyMatch = this.activeTechnology === 'All' || project.stack.includes(this.activeTechnology);
      if (!technologyMatch) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = [project.title, project.summary, project.stack.join(' ')].join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }

  onCardPointerMove(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement | null;
    if (!card) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const dx = (x / rect.width) * 2 - 1;
    const dy = (y / rect.height) * 2 - 1;

    card.style.setProperty('--tilt-x', `${-dy * 5.5}deg`);
    card.style.setProperty('--tilt-y', `${dx * 7}deg`);
    card.style.setProperty('--glow-x', `${Math.round((x / rect.width) * 100)}%`);
    card.style.setProperty('--glow-y', `${Math.round((y / rect.height) * 100)}%`);
  }

  onCardPointerLeave(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement | null;
    if (!card) {
      return;
    }

    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
    card.style.setProperty('--glow-x', '50%');
    card.style.setProperty('--glow-y', '0%');
  }

  openProjectDetails(project: ProjectItem, event: Event): void {
    const card = this.findCardElement(event.currentTarget as HTMLElement | null);
    this.activeCardRect = card?.getBoundingClientRect() ?? null;
    this.selectedProject = project;

    if (!this.isBrowser()) {
      return;
    }

    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => this.animateModalOpen());
  }

  closeProjectDetails(): void {
    if (!this.selectedProject) {
      return;
    }

    if (!this.isBrowser()) {
      this.selectedProject = null;
      return;
    }

    const panel = document.querySelector<HTMLElement>('.project-modal .modal-panel');
    if (!panel || !this.activeCardRect) {
      this.finalizeModalClose();
      return;
    }

    const panelRect = panel.getBoundingClientRect();
    const deltaX = this.activeCardRect.left + this.activeCardRect.width / 2 - (panelRect.left + panelRect.width / 2);
    const deltaY = this.activeCardRect.top + this.activeCardRect.height / 2 - (panelRect.top + panelRect.height / 2);
    const scaleX = this.activeCardRect.width / panelRect.width;
    const scaleY = this.activeCardRect.height / panelRect.height;

    panel.animate(
      [
        {
          transform: 'translate3d(0, 0, 0) scale(1)',
          opacity: '1'
        },
        {
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleX}, ${scaleY})`,
          opacity: '0.25'
        }
      ],
      {
        duration: 300,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards'
      }
    ).onfinish = () => this.finalizeModalClose();
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.closeProjectDetails();
  }

  projectTransitionId(project: ProjectItem): string {
    return project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  private animateModalOpen(): void {
    const panel = document.querySelector<HTMLElement>('.project-modal .modal-panel');
    if (!panel || !this.activeCardRect) {
      return;
    }

    const panelRect = panel.getBoundingClientRect();
    const deltaX = this.activeCardRect.left + this.activeCardRect.width / 2 - (panelRect.left + panelRect.width / 2);
    const deltaY = this.activeCardRect.top + this.activeCardRect.height / 2 - (panelRect.top + panelRect.height / 2);
    const scaleX = this.activeCardRect.width / panelRect.width;
    const scaleY = this.activeCardRect.height / panelRect.height;

    panel.animate(
      [
        {
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleX}, ${scaleY})`,
          opacity: '0.2'
        },
        {
          transform: 'translate3d(0, 0, 0) scale(1)',
          opacity: '1'
        }
      ],
      {
        duration: 360,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both'
      }
    );
  }

  private finalizeModalClose(): void {
    this.selectedProject = null;
    this.activeCardRect = null;
    document.body.style.overflow = '';
  }

  private findCardElement(target: HTMLElement | null): HTMLElement | null {
    if (!target) {
      return null;
    }

    return target.closest('.project-card');
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
