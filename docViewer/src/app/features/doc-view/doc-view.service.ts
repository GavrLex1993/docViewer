import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, throwError } from 'rxjs';

import { IDocumentApiModel, IDocumentData } from './doc-view.entity';
import { Annotation } from './annotation/annotation.entity';

@Injectable()
export class DocViewService {
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);

  public getDocument(id: string): Observable<IDocumentData> {
    return this.httpClient.get<IDocumentApiModel>(`/${id}.json`).pipe(
      map((res: IDocumentApiModel) => {
        return {
          id,
          name: res.name,
          pages: res.pages.map((p) => ({pageNumber: p.number, imageUrl: p.imageUrl}))
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const status = error.status || '500';
        this.router.navigate(['/error'], { queryParams: { status } });
        return throwError(() => error);
      })
    );
  }

  public saveDocumentAnotations(document: IDocumentData, annotations: Annotation[]): void {
    console.log('Выбранный документ: ', document);
    console.log('Сохраненные аннотации: ', annotations);
  }
}
