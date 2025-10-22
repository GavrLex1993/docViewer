import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss'],
  imports: [RouterModule]
})
export class ErrorPageComponent {
  message = 'Произошла ошибка при выполнении запроса. Пожалуйста, попробуйте позже.';
  statusCode: string | null = null;

  constructor(private route: ActivatedRoute) {
    this.statusCode = this.route.snapshot.queryParamMap.get('status');
  }
}
