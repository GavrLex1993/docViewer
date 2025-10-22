import { Component } from '@angular/core';

import { DocViewComponent } from '../../features/doc-view/doc-view.component';

@Component({
  selector: 'document-viewer-page',
  templateUrl: './document-viewer-page.component.html',
  styleUrls: ['./document-viewer-page.component.scss'],
  imports: [DocViewComponent]
})
export class DocumentViewerPageComponent {}
