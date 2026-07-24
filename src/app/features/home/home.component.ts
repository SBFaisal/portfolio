import { AsyncPipe, isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map, take } from 'rxjs';
import { PortfolioDataService } from '../../core/data/portfolio-data.service';
import { TerminalSectionComponent } from './components/terminal-section/terminal-section.component';

interface FloatingSkillChip {
  label: string;
  panelClass: string;
  top: string;
  left: string;
  delay: string;
  depth: string;
  color: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, AsyncPipe, TerminalSectionComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly portfolioDataService = inject(PortfolioDataService);
  private readonly platformId = inject(PLATFORM_ID);

  private typewriterTimer: ReturnType<typeof setTimeout> | null = null;
  private counterFrameId: number | null = null;
  private roleIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private roles: string[] = [];

  readonly particles = Array.from({ length: 16 }, (_, i) => i);
  readonly githubCounterValues = {
    repositories: 0,
    totalStars: 0,
    followers: 0
  };
  displayedRole = '';

  private readonly floatingSkillSlots = [
    { top: 10, left: 8 },
    { top: 12, left: 66 },
    { top: 24, left: 80 },
    { top: 34, left: 5 },
    { top: 52, left: 82 },
    { top: 64, left: 8 },
    { top: 74, left: 66 },
    { top: 81, left: 30 },
    { top: 22, left: 28 },
    { top: 60, left: 52 }
  ];

  private readonly floatingSkillPalette = [
    '#5de4ff',
    '#9df4c3',
    '#ffd38a',
    '#b8b0ff',
    '#ffb4c8',
    '#8fe7ff',
    '#c8ff9b',
    '#ffcfb3'
  ];

  readonly vm$ = this.portfolioDataService.data$.pipe(
    map((data) => ({
      name: data.personalDetails.name,
      hero: data.hero,
      floatingSkills: this.buildFloatingSkillChips(data.hero.floatingSkills),
      nowPlaying: data.nowPlaying,
      services: data.services,
      github: data.github
    }))
  );

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.vm$.pipe(take(1)).subscribe((vm) => {
      this.roles = vm.hero.typewriterRoles;
      if (!this.displayedRole && this.roles.length > 0) {
        this.startTypewriter();
      }

      this.startGithubCounters(vm.github.repositories, vm.github.totalStars, vm.github.followers);
    });
  }

  ngOnDestroy(): void {
    if (this.typewriterTimer) {
      clearTimeout(this.typewriterTimer);
      this.typewriterTimer = null;
    }

    if (this.counterFrameId !== null) {
      cancelAnimationFrame(this.counterFrameId);
      this.counterFrameId = null;
    }
  }

  private startTypewriter(): void {
    if (this.roles.length === 0) {
      return;
    }

    const currentRole = this.roles[this.roleIndex];

    if (!this.isDeleting) {
      this.charIndex += 1;
      this.displayedRole = currentRole.slice(0, this.charIndex);

      if (this.charIndex === currentRole.length) {
        this.isDeleting = true;
        this.typewriterTimer = setTimeout(() => this.startTypewriter(), 1200);
        return;
      }
    } else {
      this.charIndex -= 1;
      this.displayedRole = currentRole.slice(0, this.charIndex);

      if (this.charIndex === 0) {
        this.isDeleting = false;
        this.roleIndex = (this.roleIndex + 1) % this.roles.length;
      }
    }

    const delay = this.isDeleting ? 55 : 95;
    this.typewriterTimer = setTimeout(() => this.startTypewriter(), delay);
  }

  private startGithubCounters(repositories: number, totalStars: number, followers: number): void {
    const duration = 1500;
    let start: number | null = null;

    const step = (timestamp: number): void => {
      if (start === null) {
        start = timestamp;
      }

      const progress = Math.min(1, (timestamp - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);

      this.githubCounterValues.repositories = Math.round(repositories * eased);
      this.githubCounterValues.totalStars = Math.round(totalStars * eased);
      this.githubCounterValues.followers = Math.round(followers * eased);

      if (progress < 1) {
        this.counterFrameId = requestAnimationFrame(step);
        return;
      }

      this.counterFrameId = null;
    };

    this.counterFrameId = requestAnimationFrame(step);
  }

  private buildFloatingSkillChips(
    skills: { label: string; panelClass: string }[] | undefined
  ): FloatingSkillChip[] {
    if (!skills || skills.length === 0) {
      return [];
    }

    const availableSlots = [...this.floatingSkillSlots].sort(() => Math.random() - 0.5);
    const palette = [...this.floatingSkillPalette].sort(() => Math.random() - 0.5);
    const usedSlots: Array<{ top: number; left: number }> = [];

    return skills.map((skill, index) => {
      const slot = availableSlots[index] ?? this.createFallbackSlot(usedSlots);
      usedSlots.push(slot);

      return {
        label: skill.label,
        panelClass: skill.panelClass,
        top: `${slot.top}%`,
        left: `${slot.left}%`,
        delay: `${(index * 0.28).toFixed(2)}s`,
        depth: `${26 + ((index % 5) * 4)}px`,
        color: palette[index % palette.length]
      };
    });
  }

  private createFallbackSlot(usedSlots: Array<{ top: number; left: number }>): { top: number; left: number } {
    const minDistance = 14;

    for (let attempt = 0; attempt < 28; attempt += 1) {
      const candidate = {
        top: Math.round(8 + Math.random() * 76),
        left: Math.round(6 + Math.random() * 82)
      };

      const isTooClose = usedSlots.some((slot) => {
        const distance = Math.hypot(slot.top - candidate.top, slot.left - candidate.left);
        return distance < minDistance;
      });

      if (!isTooClose) {
        return candidate;
      }
    }

    return {
      top: Math.round(10 + Math.random() * 72),
      left: Math.round(8 + Math.random() * 76)
    };
  }
}
