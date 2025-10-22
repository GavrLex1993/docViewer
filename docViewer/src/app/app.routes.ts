import { Routes } from '@angular/router';

import { ErrorPageComponent } from './pages/error-page/error-page.component';
import { ListDocumentPageComponent } from './pages/list-document-page/list-document-page.component';
import { DocViewComponent } from './features/doc-view/doc-view.component';

export const routes: Routes = [
  {
    path: '',
    component: ListDocumentPageComponent
  },
  { path: 'documents/:id', loadComponent: () => DocViewComponent },
  { path: 'error', component: ErrorPageComponent },
  { path: '**', redirectTo: '' }
];
