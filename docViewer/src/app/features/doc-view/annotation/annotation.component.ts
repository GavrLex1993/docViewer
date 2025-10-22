import { ChangeDetectionStrategy, Component, ElementRef, input, model, output, signal, viewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from '@angular/material/tooltip';

import { Annotation } from './annotation.entity';

@Component({
  selector: 'annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.scss'],
  imports: [MatInput, MatIconButton, MatIcon, MatTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnotationComponent {
  public annotation = model.required<Annotation>();
  public zoom = input<number>(1);
  public containerRect = input.required<DOMRect>();

  public onDelete = output<string>();
  public onMove = output<{ id: string; x: number; y: number }>();
  public onUpdate = output<Annotation>();
  public isEditing = output<boolean>();

  public annotationEditRef = viewChild<ElementRef<HTMLInputElement>>("annotationedit");

  public editing = signal<boolean>(false);

  protected dragging = false;
  private dragOffset = { x: 0, y: 0 };
  private captureEl?: HTMLElement;

  public startDrag(event: PointerEvent): void {
    if (this.editing()) return;

    const tgt = event.target as HTMLElement | null;
    if (tgt && tgt.closest('button, input, textarea, a, [role="button"]')) return;

    event.preventDefault();
    this.dragging = true;

  const container = this.containerRect() ?? (event.currentTarget as HTMLElement).closest('.document-page-container')?.getBoundingClientRect();
  if (!container) return;
  const z = Math.max(0.0001, this.zoom());

  const pointerBaseX = (event.clientX - container.left) / z;
  const pointerBaseY = (event.clientY - container.top) / z;

  const an = this.annotation();
    this.dragOffset.x = pointerBaseX - (an.x ?? 0);
    this.dragOffset.y = pointerBaseY - (an.y ?? 0);

    const target = event.currentTarget as Element;
    try { target.setPointerCapture?.(event.pointerId); this.captureEl = target as HTMLElement; } catch { this.captureEl = undefined; }

    window.addEventListener('pointermove', this.onDragMove);
    window.addEventListener('pointerup', this.endDrag);
    this.isEditing.emit(false);
  }

  public onDragMove = (event: PointerEvent) => {
    if (!this.dragging) return;
    const container = this.containerRect();
    if (!container) return;
    const z = Math.max(0.0001, this.zoom());

    const pointerBaseX = (event.clientX - container.left) / z;
    const pointerBaseY = (event.clientY - container.top) / z;

    let desiredX = pointerBaseX - this.dragOffset.x;
    let desiredY = pointerBaseY - this.dragOffset.y;

    const el = this.captureEl ?? (event.currentTarget as HTMLElement | null);
    const elRect = el?.getBoundingClientRect();

    const elWbase = (elRect?.width ?? 0) / z;
    const elHbase = (elRect?.height ?? 0) / z;

    const maxX = Math.max(0, container.width - elWbase);
    const maxY = Math.max(0, container.height - elHbase);

    desiredX = Math.min(Math.max(0, desiredX), maxX);
    desiredY = Math.min(Math.max(0, desiredY), maxY);

    this.onMove.emit({ id: this.annotation().id, x: desiredX, y: desiredY });
  };

  private endDrag = (ev?: PointerEvent) => {
    this.dragging = false;
    if (this.captureEl && ev) {
      try { this.captureEl.releasePointerCapture?.(ev.pointerId); } catch {}
      this.captureEl = undefined;
    }
    window.removeEventListener('pointermove', this.onDragMove);
    window.removeEventListener('pointerup', this.endDrag);
  };

  public toggleEdit(): void {
    this.editing.update(value => !value);
    this.isEditing.emit(this.editing());

    setTimeout(() => {
        if (this.editing() && this.annotationEditRef()) {
        this.annotationEditRef()!.nativeElement.focus();
      }
    });
  }

  public updateText(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.value) return;

    this.annotation.update(an => ({
      ...an,
      text: input.value
    }));
    this.editing.set(false);
    this.isEditing.emit(false);
  }

  public onDeleteClick(id: string): void {
    this.onDelete.emit(id);
  }
}
