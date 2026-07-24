import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { map } from 'rxjs';
import { PortfolioDataService } from '../../data/portfolio-data.service';

type AccentTheme = 'purple' | 'cyan' | 'emerald';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteHeaderComponent {
  private readonly portfolioDataService = inject(PortfolioDataService);
  private readonly document = inject(DOCUMENT);
  private lastScrollY = 0;
  private readonly storageKey = 'portfolio-accent-theme';

  isMenuOpen = false;
  isHidden = false;
  scrollProgress = 0;
  activeAccent: AccentTheme = 'purple';

  constructor() {
    this.initializeAccentTheme();
  }

  readonly vm$ = this.portfolioDataService.data$.pipe(
    map((data) => ({
      brand: data.site.brand,
      navItems: data.site.navigation
    }))
  );

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onNavClick(): void {
    this.isMenuOpen = false;
  }

  setAccentTheme(theme: AccentTheme): void {
    this.activeAccent = theme;
    this.applyAccentTheme(theme);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, theme);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (typeof window !== 'undefined' && window.innerWidth > 880) {
      this.isMenuOpen = false;
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const currentScrollY = window.scrollY || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    this.scrollProgress = maxScroll > 0 ? Math.min(100, Math.max(0, (currentScrollY / maxScroll) * 100)) : 0;

    if (this.isMenuOpen) {
      this.isHidden = false;
      this.lastScrollY = currentScrollY;
      return;
    }

    this.isHidden = currentScrollY > this.lastScrollY && currentScrollY > 90;
    this.lastScrollY = currentScrollY;
  }

  private initializeAccentTheme(): void {
    if (typeof localStorage === 'undefined') {
      this.applyAccentTheme(this.activeAccent);
      return;
    }

    const savedTheme = localStorage.getItem(this.storageKey) as AccentTheme | null;
    if (savedTheme === 'purple' || savedTheme === 'cyan' || savedTheme === 'emerald') {
      this.activeAccent = savedTheme;
    }

    this.applyAccentTheme(this.activeAccent);
  }

  private applyAccentTheme(theme: AccentTheme): void {
    const root = this.document.documentElement;
    root.setAttribute('data-accent', theme);
  }
}
