import { ChangeDetectionStrategy, Component, inject, Signal, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PageTitleService } from './core/services/page-title.service';
import { PageHeaderControlsService } from './core/services/page-header-controls/page-header-controls.service';
import { IPageHeaderControl } from './core/services/page-header-controls/page-header-controls.entity';
import { PageHeaderControlsComponent } from './core/components/page-header-controls/page-header-controls.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    PageHeaderControlsComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly pageTitleService = inject(PageTitleService);
  private readonly pageHeaderControlsService = inject(PageHeaderControlsService);

  protected readonly pageTitle: Signal<string> = this.pageTitleService.pageTitle;
  protected readonly pageHeaderControls: Signal<IPageHeaderControl[]> = this.pageHeaderControlsService.headerControls;
}
