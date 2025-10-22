import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, shareReplay, switchMap, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { DocViewService } from './doc-view.service';
import { IDocumentData, IContainerRect } from './doc-view.entity';
import { AnnotationComponent } from './annotation/annotation.component';
import { Annotation, ITextAnnotation } from './annotation/annotation.entity';
import { PageTitleService } from '../../core/services/page-title.service';
import { PageHeaderControlsService } from '../../core/services/page-header-controls/page-header-controls.service';
import { IPageHeaderControl } from '../../core/services/page-header-controls/page-header-controls.entity';

@Component({
  selector: 'doc-view',
  templateUrl: './doc-view.component.html',
  styleUrls: ['./doc-view.component.scss'],
  imports: [AnnotationComponent],
  providers: [DocViewService],
})
export class DocViewComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly docViewService = inject(DocViewService, { self: true });
  private readonly pageTitleService = inject(PageTitleService);
  private readonly pageHeaderControlsService = inject(PageHeaderControlsService);

  public document = toSignal<IDocumentData>(
    this.activatedRoute.paramMap.pipe(
      filter((params) => params.has('id')),
      switchMap((params) => {
        const id = params.get('id')!;
        return this.docViewService.getDocument(id);
      }),
      tap((res) => this.pageTitleService.setTitle(res.name)),
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

  private readonly docViewControls: IPageHeaderControl[] = [
    {
      type: "span",
      content: computed(() => {
        const res = Math.round(this.zoom() * 100).toString();
        return res;
      })
    },
    {
      type: "button",
      content: signal("+"),
      onClick: () => this.zoomIn()
    },
    {
      type: "button",
      content: signal("-"),
      onClick: () => this.zoomOut()
    },
    {
      type: "button",
      content: signal("Save"),
      onClick: () => this.saveAnnotations()
    }
  ];

  public ngOnInit(): void {
    this.pageHeaderControlsService.addControls(this.docViewControls);
  }

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

    const target = event.target as HTMLElement;
    if (!target.classList.contains('page-image')) return;

    const imgRect = target.getBoundingClientRect();
    if (
      event.clientX < imgRect.left ||
      event.clientX > imgRect.right ||
      event.clientY < imgRect.top ||
      event.clientY > imgRect.bottom
    ) {
      return;
    }

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
