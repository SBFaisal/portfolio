import { Component, input } from '@angular/core';

@Component({
  selector: 'app-project-card',
  standalone: true,
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss'
})
export class ProjectCardComponent {
  readonly title = input.required<string>();
  readonly summary = input.required<string>();
  readonly stack = input.required<string[]>();
  readonly link = input.required<string>();
}
