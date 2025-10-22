import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PageTitleService {
  private _pageTitle = signal<string>("");

  public get pageTitle() {
    return this._pageTitle.asReadonly();
  }

  public setTitle(title: string): void {
    return this._pageTitle.set(title);
  }
}
