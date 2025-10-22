import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, shareReplay, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { DocViewService } from './doc-view.service';
import { IDocumentData, IContainerRect } from './doc-view.entity';
import { AnnotationComponent } from './annotation/annotation.component';
import { Annotation, ITextAnnotation } from './annotation/annotation.entity';

@Component({
  selector: 'doc-view',
  templateUrl: './doc-view.component.html',
  styleUrls: ['./doc-view.component.scss'],
  imports: [AnnotationComponent],
  providers: [DocViewService],
})
export class DocViewComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly docViewService = inject(DocViewService, { self: true });

  public document = toSignal<IDocumentData>(
    this.activatedRoute.paramMap.pipe(
      filter((params) => params.has('id')),
      switchMap((params) => {
        const id = params.get('id')!;
        return this.docViewService.getDocument(id);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    )
  );
  public zoom = signal<number>(1);
  public annotations = signal<Annotation[]>([]);
  public editing = signal<boolean>(false);

  public containerRects = computed(() => {
    const pages = this.document()!.pages;
    const rects: IContainerRect = {};
    const containers = window.document.querySelectorAll('.document-page-container');
    containers.forEach((el, index) => {
      rects[pages[index].pageNumber] = el.getBoundingClientRect();
    });
    return rects;
  });

  public zoomIn(): void {
    this.zoom.update((value) => value + 0.1);
  }

  public zoomOut(): void {
    this.zoom.update((value) => Math.max(0.1, value - 0.1));
  }

  public getPageAnnotations(pageNumber: number) {
    return this.annotations().filter((a) => a.pageNumber === pageNumber);
  }

  public addAnnotation(pageNumber: number, event: MouseEvent): void {
    if (this.editing()) return;

    // For simplicity, a browser dialog window was used.
    // Ideally, separate logic for selecting the annotation type (text, image, SVG, etc.) would be needed,
    // and each type should have its own implementation.
    const text = prompt('Введите текст аннотации:');
    if (!text) return;

    const id = crypto.randomUUID();
    const container = (event.target as HTMLElement).closest('.document-page-container')!;
    const containerRect = container.getBoundingClientRect();
    const x = (event.clientX - containerRect.left) / this.zoom();
    const y = (event.clientY - containerRect.top) / this.zoom();

    const newAnnotation: ITextAnnotation = {
      id,
      type: 'text',
      pageNumber,
      text: text,
      x,
      y,
    };

    this.annotations.update((annotations) => [...annotations, newAnnotation]);
  }

  public isEditing(flag: boolean): void {
    this.editing.set(flag);
  }

  public deleteAnnotation(id: string) {
    this.annotations.update((annotations) => {
      return annotations.filter((a) => a.id !== id);
    });
  }

  public saveAnnotations() {
    this.docViewService.saveDocumentAnotations(this.document()!, this.annotations());
  }
}
