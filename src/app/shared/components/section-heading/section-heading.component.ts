import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-heading',
  standalone: true,
  templateUrl: './section-heading.component.html',
  styleUrl: './section-heading.component.scss'
})
export class SectionHeadingComponent {
  readonly eyebrow = input('Section');
  readonly title = input.required<string>();
  readonly description = input('');
}
