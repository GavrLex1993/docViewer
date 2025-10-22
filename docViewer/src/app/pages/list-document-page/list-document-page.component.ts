import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'list-document-page',
  templateUrl: './list-document-page.component.html',
  styleUrls: ['./list-document-page.component.scss'],
  imports: [MatListModule, MatIconModule, RouterModule]
})
export class ListDocumentPageComponent {}
