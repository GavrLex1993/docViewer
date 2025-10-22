import { Component, ElementRef, input, model, output, signal, viewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from '@angular/material/tooltip';

import { Annotation } from './annotation.entity';

@Component({
  selector: 'annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.scss'],
  imports: [MatInput, MatIconButton, MatIcon, MatTooltip]
})
export class AnnotationComponent {
  public annotation = model.required<Annotation>();
  public zoom = input<number>(1);
  public containerRect = input.required<DOMRect>();

  public onDelete = output<string>();
  public isEditing = output<boolean>();

  public annotationEditRef = viewChild<ElementRef<HTMLInputElement>>("annotationedit");

  public editing = signal<boolean>(false);

  protected dragging = false;
  private dragOffset = { x: 0, y: 0 };

  public startDrag(event: PointerEvent): void {
    if (this.editing()) return;

    event.preventDefault();
    this.dragging = true;

    const pointerX = (event.clientX - this.containerRect().left) / this.zoom();
    const pointerY = (event.clientY - this.containerRect().top) / this.zoom();

    const an = this.annotation();
    this.dragOffset.x = pointerX - an.x;
    this.dragOffset.y = pointerY - an.y;

    window.addEventListener('pointermove', this.onDragMove);
    window.addEventListener('pointerup', this.endDrag);
  }

  public onDragMove = (event: PointerEvent) => {
    if (!this.dragging) return;

    const x = (event.clientX - this.containerRect().left) / this.zoom() - this.dragOffset.x;
    const y = (event.clientY - this.containerRect().top) / this.zoom() - this.dragOffset.y;

    this.annotation.update(an => ({
      ...an,
      x,
      y
    }));
  };

  public endDrag = () => {
    this.dragging = false;

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
