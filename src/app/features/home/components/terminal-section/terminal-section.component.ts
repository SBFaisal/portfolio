import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { map, take } from 'rxjs';
import { PortfolioDataService } from '../../../../core/data/portfolio-data.service';

type TerminalLineKind = 'system' | 'input' | 'output' | 'error';

interface TerminalLine {
  text: string;
  kind: TerminalLineKind;
}

interface TerminalContext {
  name: string;
  role: string;
  about: string;
  skills: string[];
  projects: string[];
  contact: string[];
}

@Component({
  selector: 'app-terminal-section',
  standalone: true,
  templateUrl: './terminal-section.component.html',
  styleUrl: './terminal-section.component.scss'
})
export class TerminalSectionComponent implements OnInit {
  private readonly portfolioDataService = inject(PortfolioDataService);
  private readonly platformId = inject(PLATFORM_ID);

  private context: TerminalContext | null = null;

  readonly lines: TerminalLine[] = [
    { text: 'Portfolio interactive terminal initialized.', kind: 'system' },
    { text: 'Type "help" to see available commands.', kind: 'system' }
  ];

  readonly commands = ['help', 'about', 'skills', 'projects', 'contact', 'clear'];

  ngOnInit(): void {
    this.portfolioDataService.data$
      .pipe(
        take(1),
        map((data) => ({
          name: data.personalDetails.name,
          role: data.personalDetails.role,
          about: data.about.shortStory,
          skills: data.technologies.groups.flatMap((group) => group.items.map((item) => item.name)).slice(0, 12),
          projects: data.projects.items.map((project) => project.title),
          contact: data.contact.channels.map((channel) => `${channel.label}: ${channel.value}`)
        }))
      )
      .subscribe((context) => {
        this.context = context;
      });
  }

  onSubmit(event: Event, input: HTMLInputElement): void {
    event.preventDefault();

    const rawValue = input.value.trim();
    if (!rawValue) {
      return;
    }

    this.pushLine(`visitor@portfolio:~$ ${rawValue}`, 'input');
    this.handleCommand(rawValue.toLowerCase());
    input.value = '';

    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => {
        input.focus();
      });
    }
  }

  private handleCommand(command: string): void {
    const ctx = this.context;

    switch (command) {
      case 'help':
        this.pushLine(`Commands: ${this.commands.join(', ')}`, 'output');
        break;
      case 'about':
        if (!ctx) {
          this.pushLine('Loading profile context. Try again in a moment.', 'error');
          return;
        }

        this.pushLine(`${ctx.name} | ${ctx.role}`, 'output');
        this.pushLine(ctx.about, 'output');
        break;
      case 'skills':
        if (!ctx) {
          this.pushLine('Skills are still loading. Try again in a moment.', 'error');
          return;
        }

        this.pushLine(`Core skills: ${ctx.skills.join(', ')}`, 'output');
        break;
      case 'projects':
        if (!ctx) {
          this.pushLine('Projects are still loading. Try again in a moment.', 'error');
          return;
        }

        this.pushLine(`Featured projects: ${ctx.projects.join(' | ')}`, 'output');
        break;
      case 'contact':
        if (!ctx) {
          this.pushLine('Contact details are still loading. Try again in a moment.', 'error');
          return;
        }

        for (const entry of ctx.contact) {
          this.pushLine(entry, 'output');
        }
        break;
      case 'clear':
        this.lines.splice(0, this.lines.length);
        break;
      default:
        this.pushLine(`Command not found: ${command}`, 'error');
        this.pushLine('Type "help" for available commands.', 'system');
    }

    if (this.lines.length > 80) {
      this.lines.splice(0, this.lines.length - 80);
    }
  }

  private pushLine(text: string, kind: TerminalLineKind): void {
    this.lines.push({ text, kind });
  }
}
