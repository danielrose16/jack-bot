import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    { path: '', redirectTo: 'chat', pathMatch: 'full' },
    { path: 'chat', loadComponent: () => import('./chat/chat.component').then(m => m.ChatComponent) }
];
