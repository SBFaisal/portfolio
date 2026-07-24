import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { PortfolioDataService } from '../../core/data/portfolio-data.service';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [SectionHeadingComponent, AsyncPipe, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnDestroy {
  private readonly portfolioDataService = inject(PortfolioDataService);
  private readonly formBuilder = inject(FormBuilder);
  private submitTimer: ReturnType<typeof setTimeout> | null = null;

  isSubmitting = false;
  submitSuccess = false;

  readonly contactForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.minLength(4)]],
    message: ['', [Validators.required, Validators.minLength(12)]]
  });

  readonly vm$ = this.portfolioDataService.data$.pipe(
    map((data) => ({
      ...data.contact,
      socialChannels: data.contact.channels.filter((channel) =>
        ['Email', 'LinkedIn', 'GitHub'].includes(channel.label)
      )
    }))
  );

  ngOnDestroy(): void {
    if (this.submitTimer) {
      clearTimeout(this.submitTimer);
      this.submitTimer = null;
    }
  }

  onSubmit(): void {
    this.submitSuccess = false;

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitTimer = setTimeout(() => {
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.contactForm.reset();
    }, 1300);
  }

  showError(controlName: 'name' | 'email' | 'subject' | 'message'): boolean {
    const control = this.contactForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  getError(controlName: 'name' | 'email' | 'subject' | 'message'): string {
    const control = this.contactForm.controls[controlName];

    if (control.hasError('required')) {
      return 'This field is required.';
    }

    if (control.hasError('email')) {
      return 'Please enter a valid email address.';
    }

    if (control.hasError('minlength')) {
      if (controlName === 'name') {
        return 'Name must be at least 2 characters.';
      }

      if (controlName === 'subject') {
        return 'Subject must be at least 4 characters.';
      }

      return 'Message must be at least 12 characters.';
    }

    return 'Invalid value.';
  }
}
