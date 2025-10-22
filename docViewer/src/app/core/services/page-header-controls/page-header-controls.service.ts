import { Injectable, signal } from '@angular/core';

import { IPageHeaderControl } from './page-header-controls.entity';

@Injectable({ providedIn: 'root' })
export class PageHeaderControlsService {
  private _headerControls = signal<IPageHeaderControl[]>([]);

  public get headerControls() {
    return this._headerControls.asReadonly();
  }

  public addControls(newControls: IPageHeaderControl[]): void {
    return this._headerControls.update((controls) => [...controls, ...newControls]);
  }

  public clearControls(): void {
    this._headerControls.set([]);
  }
}
