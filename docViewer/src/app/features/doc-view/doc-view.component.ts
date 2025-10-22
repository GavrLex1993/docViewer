import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocViewComponent implements OnInit, AfterViewInit, OnDestroy {
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
      tap((res) => {
        this.pageTitleService.setTitle(res.name);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    )
  );
  public zoom = signal<number>(1);
  public annotations = signal<Annotation[]>([]);
  public editing = signal<boolean>(false);

  public baseSizes = signal<Record<number, { width: number; height: number }>>({});

  public containerRects = computed(() => {
    const z = this.zoom();
    const rects: IContainerRect = {};
    const containers = window.document.querySelectorAll<HTMLElement>('.document-page-container');

    containers.forEach((el) => {
      const pageNumAttr = el.dataset['pageNumber'];
      const pageNumber = pageNumAttr ? Number(pageNumAttr) : undefined;
      if (!pageNumber) return;
      const measured = el.getBoundingClientRect();
      const base = this.baseSizes()[pageNumber];
      rects[pageNumber] = {
        left: measured.left,
        top: measured.top,
        width: base?.width ?? measured.width / Math.max(0.0001, z),
        height: base?.height ?? measured.height / Math.max(0.0001, z),
        right: measured.right,
        bottom: measured.bottom,
      } as DOMRect;
    });

    return rects;
  });

  private resizeHandler = () => this.recomputeBaseHeights();

  private readonly docViewControls: IPageHeaderControl[] = [
    {
      type: 'span',
      content: computed(() => {
        const res = Math.round(this.zoom() * 100).toString();
        return res;
      }),
    },
    {
      type: 'button',
      content: signal('+'),
      onClick: () => this.zoomIn(),
    },
    {
      type: 'button',
      content: signal('-'),
      onClick: () => this.zoomOut(),
    },
    {
      type: 'button',
      content: signal('Save'),
      onClick: () => this.saveAnnotations(),
    },
  ];

  public ngOnInit(): void {
    this.pageHeaderControlsService.addControls(this.docViewControls);
  }

  public ngAfterViewInit(): void {
    // initial calculation and watch resize to keep base sizes correct
    setTimeout(() => this.recomputeBaseHeights(), 0);
    window.addEventListener('resize', this.resizeHandler);
  }

  public ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
  }

  public zoomIn(): void {
    this.zoom.update((value) => value + 0.1);
    setTimeout(() => this.recomputeBaseHeights(), 0);
  }

  public zoomOut(): void {
    this.zoom.update((value) => Math.max(0.1, value - 0.1));
    setTimeout(() => this.recomputeBaseHeights(), 0);
  }

  public onImageLoad(pageNumber: number, ev: Event): void {
    const img = ev.target as HTMLImageElement | null;
    if (!img) return;
    const z = Math.max(0.0001, this.zoom());
    const clientW = img.clientWidth || img.naturalWidth || 800;
    const clientH = img.clientHeight || img.naturalHeight || 1100;
    const baseW = Math.max(1, clientW / z);
    const baseH = Math.max(1, clientH / z);
    this.baseSizes.update((s) => ({ ...s, [pageNumber]: { width: baseW, height: baseH } }));
    setTimeout(() => this.recomputeBaseHeights(), 0);
  }

  private recomputeBaseHeights(): void {
    const imgs = Array.from(
      document.querySelectorAll<HTMLImageElement>('.document-page-container img.page-image')
    );
    const nextBase: Record<number, { width: number; height: number }> = { ...this.baseSizes() };
    imgs.forEach((img) => {
      const container = img.closest('.document-page-container') as HTMLElement | null;
      const pageNumAttr = container?.dataset['pageNumber'];
      const pageNumber = pageNumAttr ? Number(pageNumAttr) : undefined;
      if (!pageNumber) return;
      if (!img.naturalWidth) return;
      const z = Math.max(0.0001, this.zoom());
      const clientW = img.clientWidth || img.naturalWidth || 800;
      const clientH = img.clientHeight || img.naturalHeight || 1100;
      nextBase[pageNumber] = { width: Math.max(1, clientW / z), height: Math.max(1, clientH / z) };
    });
    this.baseSizes.set(nextBase);
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
    const z = Math.max(0.0001, this.zoom());
    const x = (event.clientX - containerRect.left) / z;
    const y = (event.clientY - containerRect.top) / z;

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

  public onAnnotationMove(payload: { id: string; x: number; y: number }): void {
    this.annotations.update((arr) =>
      arr.map((a) => (a.id === payload.id ? { ...a, x: payload.x, y: payload.y } : a))
    );
  }

  public onAnnotationUpdate(updated: ITextAnnotation): void {
    this.annotations.update((arr) =>
      arr.map((a) => (a.id === updated.id ? { ...a, ...(updated as ITextAnnotation) } : a))
    );
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
