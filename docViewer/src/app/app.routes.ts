import { Routes } from '@angular/router';

import { ErrorPageComponent } from './pages/error-page/error-page.component';
import { ListDocumentPageComponent } from './pages/list-document-page/list-document-page.component';
import { DocumentViewerPageComponent } from './pages/document-viewer-page/document-viewer-page.component';

export const routes: Routes = [
  {
    path: '',
    component: ListDocumentPageComponent
  },
  { path: 'documents/:id', loadComponent: () => DocumentViewerPageComponent },
  { path: 'error', component: ErrorPageComponent },
  { path: '**', redirectTo: '' }
];
