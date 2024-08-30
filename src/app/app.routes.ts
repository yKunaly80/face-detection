import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'face-detection',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'face-detection'
    },
    {
        path: 'face-detection',
        loadComponent: () => import('./face-detection/face-detection.component').then(c => c.FaceDetectionComponent)
    },
];
