import { Component, input } from '@angular/core';
import { MatButton } from '@angular/material/button';

import { IPageHeaderControl } from '../../services/page-header-controls/page-header-controls.entity';

@Component({
  selector: 'page-header-controls',
  imports: [MatButton],
  templateUrl: './page-header-controls.component.html',
})
export class PageHeaderControlsComponent {
  public pageHeaderControls = input<IPageHeaderControl[]>([]);
}
