import { Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'btp-home',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './home.component.html',
  styles: [],
})
export class HomeComponent {}
