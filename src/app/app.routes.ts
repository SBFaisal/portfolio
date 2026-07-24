import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'home'
	},
	{
		path: 'home',
		loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
		title: 'Home | Portfolio',
		data: {
			description: 'Premium portfolio of Mohammad Faisal featuring modern Angular, .NET, and cloud-focused product engineering.'
		}
	},
	{
		path: 'about',
		loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent),
		title: 'About | Portfolio',
		data: {
			description: 'Explore experience timeline, skills, and technology expertise across frontend and full-stack development.'
		}
	},
	{
		path: 'projects',
		loadComponent: () => import('./features/projects/projects.component').then((m) => m.ProjectsComponent),
		title: 'Projects | Portfolio',
		data: {
			description: 'View featured product projects with tech stack filters, live demos, and source repositories.'
		}
	},
	{
		path: 'contact',
		loadComponent: () => import('./features/contact/contact.component').then((m) => m.ContactComponent),
		title: 'Contact | Portfolio',
		data: {
			description: 'Get in touch for Angular consulting, frontend engineering, and full-stack product collaboration.'
		}
	},
	{
		path: '**',
		loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
		title: '404 | Portfolio',
		data: {
			description: 'The page you are looking for could not be found.'
		}
	}
];
