import { Component, HostListener, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { SiteFooterComponent } from './core/layout/site-footer/site-footer.component';
import { SiteHeaderComponent } from './core/layout/site-header/site-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  private revealObserver: IntersectionObserver | null = null;
  private routeSubscription: Subscription | null = null;
  private motionCleanup: Array<() => void> = [];
  private parallaxElements: HTMLElement[] = [];
  private prefersReducedMotion = false;

  mouseX = 0;
  mouseY = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.mouseX = Math.round(window.innerWidth / 2);
      this.mouseY = Math.round(window.innerHeight / 2);

      // Prevent browser history from restoring horizontal scroll offset.
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }

      this.lockHorizontalScroll();
      requestAnimationFrame(() => this.lockHorizontalScroll());
    }
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.hideLoadingScreen();
    this.initializeMotion();
    this.updateSeoTags();
    this.routeSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        requestAnimationFrame(() => {
          this.initializeMotion();
          this.updateSeoTags();
        });
      });
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.revealObserver = null;
    this.routeSubscription?.unsubscribe();
    this.routeSubscription = null;

    for (const cleanup of this.motionCleanup) {
      cleanup();
    }
    this.motionCleanup = [];
  }

  @HostListener('window:pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--mouse-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${event.clientY}px`);
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  lockHorizontalScroll(): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.scrollX !== 0) {
      window.scrollTo({
        left: 0,
        top: window.scrollY,
        behavior: 'auto'
      });
    }
  }

  private initializeMotion(): void {
    if (typeof document === 'undefined') {
      return;
    }

    this.revealObserver?.disconnect();
    this.revealObserver = null;
    for (const cleanup of this.motionCleanup) {
      cleanup();
    }
    this.motionCleanup = [];

    this.setupScrollReveal();
    this.setupMagneticButtons();
    this.setupParallax();
  }

  private setupScrollReveal(): void {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        'main .section, main .glass-card, main .project-card, main .timeline-item, main .service-card, main .repo-card, main .metric-card'
      )
    );

    if (this.prefersReducedMotion) {
      for (const target of targets) {
        target.classList.add('reveal-on-scroll', 'in-view');
      }
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -12%'
      }
    );

    for (const target of targets) {
      target.classList.add('reveal-on-scroll');
      const siblings = Array.from(target.parentElement?.children ?? []);
      const staggerIndex = Math.max(0, siblings.indexOf(target));
      target.style.setProperty('--stagger-index', `${staggerIndex}`);
      this.revealObserver.observe(target);
    }
  }

  private setupMagneticButtons(): void {
    if (this.prefersReducedMotion) {
      return;
    }

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.btn, .submit-btn, .back-top, .card-actions a, .quick-links a, .social-link, .social-item'
      )
    );

    for (const target of targets) {
      target.classList.add('magnetic-target');

      const moveHandler = (event: PointerEvent): void => {
        const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        target.style.setProperty('--mx', `${Math.max(-9, Math.min(9, x * 0.18)).toFixed(2)}px`);
        target.style.setProperty('--my', `${Math.max(-9, Math.min(9, y * 0.18)).toFixed(2)}px`);
      };

      const leaveHandler = (): void => {
        target.style.setProperty('--mx', '0px');
        target.style.setProperty('--my', '0px');
      };

      target.addEventListener('pointermove', moveHandler);
      target.addEventListener('pointerleave', leaveHandler);

      this.motionCleanup.push(() => {
        target.removeEventListener('pointermove', moveHandler);
        target.removeEventListener('pointerleave', leaveHandler);
      });
    }
  }

  private setupParallax(): void {
    this.parallaxElements = Array.from(document.querySelectorAll<HTMLElement>('.aurora, .particle, [data-parallax]'));

    if (!this.parallaxElements.length || this.prefersReducedMotion) {
      return;
    }

    const updateParallax = (): void => {
      const scrollY = window.scrollY;
      for (const element of this.parallaxElements) {
        const speed = Number(element.dataset['parallax'] ?? '0.065');
        const y = Math.max(-24, Math.min(24, scrollY * speed));
        element.style.setProperty('--parallax-y', `${y.toFixed(2)}px`);
      }
    };

    updateParallax();
    const scrollHandler = (): void => updateParallax();
    window.addEventListener('scroll', scrollHandler, { passive: true });

    this.motionCleanup.push(() => {
      window.removeEventListener('scroll', scrollHandler);
    });
  }

  private updateSeoTags(): void {
    const route = this.getDeepestRoute(this.activatedRoute);
    const description = route.snapshot.data['description'] as string | undefined;

    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:description', content: description });
      this.meta.updateTag({ name: 'twitter:description', content: description });
    }

    const title = this.document.title;
    if (title) {
      this.meta.updateTag({ property: 'og:title', content: title });
      this.meta.updateTag({ name: 'twitter:title', content: title });
    }

    const canonicalHref = typeof window !== 'undefined' ? `${window.location.origin}${this.router.url}` : this.router.url;
    this.meta.updateTag({ property: 'og:url', content: canonicalHref });
    let canonicalLink = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!canonicalLink) {
      canonicalLink = this.document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      this.document.head.appendChild(canonicalLink);
    }

    canonicalLink.setAttribute('href', canonicalHref);
  }

  private getDeepestRoute(route: ActivatedRoute): ActivatedRoute {
    let current = route;
    while (current.firstChild) {
      current = current.firstChild;
    }
    return current;
  }

  private hideLoadingScreen(): void {
    const loader = this.document.getElementById('app-loading-screen');
    if (!loader) {
      return;
    }

    loader.classList.add('hidden');
    window.setTimeout(() => {
      loader.remove();
    }, 280);
  }
}
