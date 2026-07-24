import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PortfolioDataService } from '../../data/portfolio-data.service';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteFooterComponent {
  private readonly portfolioDataService = inject(PortfolioDataService);
  private readonly ringRadius = 18;
  private readonly ringCircumference = 2 * Math.PI * this.ringRadius;

  readonly year = new Date().getFullYear();
  scrollProgress = 0;
  roundedScrollProgress = 0;
  ringOffset = this.ringCircumference;

  readonly vm$ = this.portfolioDataService.data$.pipe(
    map((data) => ({
      brand: data.site.brand,
      quickLinks: data.site.navigation,
      owner: data.site.copyrightOwner,
      tagline: data.site.footerTagline,
      socialLinks: data.contact.channels.filter((channel) => ['LinkedIn', 'GitHub', 'Email'].includes(channel.label)),
      email: data.personalDetails.email
    }))
  );

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = maxScroll > 0 ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100)) : 0;
    this.roundedScrollProgress = Math.round(this.scrollProgress);
    this.ringOffset = this.ringCircumference - (this.scrollProgress / 100) * this.ringCircumference;
  }
}
