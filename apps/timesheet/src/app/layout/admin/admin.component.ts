import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../ui/sidebar/sidebar.component';
import { HeaderComponent } from '../../ui/header/header.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { IsFetchingService, IsMutatingService } from '@ngneat/query';

@Component({
  standalone: true,
  imports: [RouterModule, HeaderComponent, SidebarComponent],
  templateUrl: './admin.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {
  isFetchingService = inject(IsFetchingService);
  isMutatingervice = inject(IsMutatingService);
  isFetching = toSignal(this.isFetchingService.use());
  isMutating = toSignal(this.isMutatingervice.use());
}
