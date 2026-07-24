export interface NavItem {
  label: string;
  path: string;
}

export interface HeroSection {
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  typewriterRoles: string[];
  resumeUrl: string;
  primaryCta: {
    label: string;
    path: string;
  };
  secondaryCta: {
    label: string;
    path: string;
  };
  floatingSkills: {
    label: string;
    panelClass: string;
  }[];
}

export interface NowPlayingSection {
  label: string;
  focusTitle: string;
  focusDescription: string;
  status: string;
  stack: string[];
  updatedAt: string;
}

export interface AboutQuickStat {
  label: string;
  value: number | string;
  suffix?: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  duration: string;
  responsibilities: string[];
  technologies: string[];
}

export interface TechnologyGroup {
  category: string;
  items: TechnologyItem[];
}

export interface TechnologyItem {
  name: string;
  level: number;
}

export interface ProjectItem {
  title: string;
  summary: string;
  stack: string[];
  previewImage: string;
  githubUrl: string;
  liveDemoUrl: string;
}

export interface ServiceItem {
  title: string;
  icon: 'backend' | 'frontend' | 'api' | 'azure' | 'database';
  description: string;
}

export interface GithubRepository {
  name: string;
  description: string;
  stars: number;
  language: string;
  url: string;
}

export interface GithubLanguage {
  name: string;
  percent: number;
}

export interface ContactChannel {
  label: string;
  value: string;
  href: string;
  external: boolean;
}

export interface PortfolioData {
  site: {
    brand: string;
    copyrightOwner: string;
    footerTagline: string;
    navigation: NavItem[];
  };
  personalDetails: {
    name: string;
    role: string;
    email: string;
    location: string;
  };
  hero: HeroSection;
  nowPlaying: NowPlayingSection;
  about: {
    eyebrow: string;
    title: string;
    description: string;
    profileImage: string;
    shortStory: string;
    careerSummary: string;
    quickStats: AboutQuickStat[];
  };
  experience: {
    eyebrow: string;
    title: string;
    description: string;
    items: ExperienceItem[];
  };
  technologies: {
    eyebrow: string;
    title: string;
    description: string;
    groups: TechnologyGroup[];
  };
  projects: {
    eyebrow: string;
    title: string;
    description: string;
    items: ProjectItem[];
  };
  services: {
    eyebrow: string;
    title: string;
    description: string;
    items: ServiceItem[];
  };
  github: {
    eyebrow: string;
    title: string;
    description: string;
    followers: number;
    totalStars: number;
    repositories: number;
    contributionCalendar: number[];
    topLanguages: GithubLanguage[];
    featuredRepositories: GithubRepository[];
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    channels: ContactChannel[];
  };
}
