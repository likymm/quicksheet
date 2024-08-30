import {
  Injectable,
  inject,
  WritableSignal,
  signal,
  Signal,
} from '@angular/core';
import { BillingTypeService, UserProjectTaskService } from '../../../api';
import { BaseService } from '../base.service';
import { switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjectQueryService extends BaseService {
  private projectService = inject(UserProjectTaskService);
  private billTypeService = inject(BillingTypeService);

  getBillTypes(enable = signal(true)) {
    return this.signalsToObservable([enable]).pipe(
      switchMap(() => {
        return this.useQuery({
          queryKey: ['bill-types'],
          queryFn: () => {
            return this.billTypeService.getBillingTypes$Json();
          },
          enabled: enable(),
        }).result$;
      })
    );
  }

  getUserProjects(
    userId: WritableSignal<string | null> | Signal<string | null>,
    entity: WritableSignal<string | null>,
    enable = signal(true)
  ) {
    return this.signalsToObservable([userId, entity, enable]).pipe(
      switchMap(() => {
        return this.useQuery({
          queryKey: ['projects', userId(), entity()],
          queryFn: () => {
            return this.projectService.getUserProjects$Json({
              userId: userId()!,
              entity: entity()!,
            });
          },
          enabled: Boolean(userId() && entity() && enable()),
        }).result$;
      })
    );
  }

  getUserTask(
    userId: WritableSignal<string | null> | Signal<string | null>,
    entity: WritableSignal<string | null>,
    projectCode: WritableSignal<string | null>,
    enable = signal(true)
  ) {
    return this.signalsToObservable([userId, entity, projectCode, enable]).pipe(
      switchMap(() => {
        return this.useQuery({
          queryKey: ['tasks', userId(), entity(), projectCode()],
          queryFn: () => {
            return this.projectService.getUserTasks$Json({
              userId: userId()!,
              entity: entity()!,
              projectCode: projectCode()!,
            });
          },
          enabled: Boolean(userId() && entity() && enable() && projectCode()),
        }).result$;
      })
    );
  }
}
