import {
  Injectable,
  inject,
  WritableSignal,
  signal,
  Signal,
} from '@angular/core';
import {
  TimesheetDetailDto,
  TimesheetDetailService,
  TimesheetHeaderDto,
} from '../../../api';
import { BaseService } from '../base.service';
import { of, switchMap } from 'rxjs';
import { UseMutation, QueryClientService } from '@ngneat/query';
import { TimesheetStatus } from '../../types/timesheet';
import { debounce, head, times } from 'lodash';

export interface TimesheetApprovalRequest {
  action: TimesheetStatus;
  remarks: string;
  detailId?: number;
  headerId?: number;
}

@Injectable({ providedIn: 'root' })
export class TimesheetDetailQuerysService extends BaseService {
  private mutation = inject(UseMutation);
  private queryClient = inject(QueryClientService);
  private timesheetDetailService = inject(TimesheetDetailService);

  saveHeader(
    headerId: WritableSignal<number> | Signal<number>,
    loading: WritableSignal<boolean>,
    successCallback?: (newId: number) => void
  ) {
    return this.mutation(
      (timesheetHeader: TimesheetHeaderDto) => {
        return this.timesheetDetailService.saveTimesheetHeader({
          body: timesheetHeader,
        });
      },
      {
        onMutate: () => {
          loading.set(true);
        },
        onSuccess: res => {
          const newId = res as unknown as number;
          this.queryClient.invalidateQueries(['timesheet-headers']);
          this.queryClient.invalidateQueries(['timesheet-template-headers']);
          this.queryClient.invalidateQueries([
            'current-timesheet-header',
            newId || headerId(),
          ]);
          if (newId) {
            successCallback?.(newId);
          }

          loading.set(false);
        },
      }
    );
  }

  deleteTimesheetDetails(
    header:
      | Signal<TimesheetHeaderDto | undefined>
      | WritableSignal<TimesheetHeaderDto | undefined>,
    successCallback?: () => void
  ) {
    return this.mutation(
      (detailIds: number[]) => {
        return this.timesheetDetailService.deleteTimesheetDetail({
          body: detailIds,
        });
      },
      {
        onSuccess: () => {
          this.queryClient.invalidateQueries([
            'timesheet-header-details',
            header()?.TMHeaderID,
          ]);
          this.queryClient.invalidateQueries(['timesheet-headers']);
          this.queryClient.invalidateQueries([
            'current-timesheet-header',
            header()?.TMHeaderID,
          ]);
          successCallback?.();
        },
        onMutate: async detailIds => {
          if (header()?.TMHeaderID) {
            this.optimisticTimesheetDetailsDelete(
              detailIds,
              header()!.TMHeaderID!
            );
          }
        },
      }
    );
  }

  getTimesheetHeaders(
    userId: WritableSignal<string | null> | Signal<string | null>,
    entity: WritableSignal<string | null> | Signal<string | null>,
    status: WritableSignal<string | null> | Signal<string | null>,
    enable = signal(true),
    isCache = signal(true)
  ) {
    return this.signalsToObservable([userId, entity, status, enable]).pipe(
      switchMap(() => {
        const isTemplate = false;
        return this.useQuery({
          queryKey: [
            'timesheet-headers',
            userId(),
            entity(),
            status(),
            isTemplate,
          ],
          queryFn: () => {
            return this.timesheetDetailService.getTimesheetHeaders$Json({
              entity: entity()!,
              userId: userId() ?? undefined,
              status: status() ?? undefined,
              isTemplate,
            });
          },
          staleTime: isCache() ? 1000 * 60 * 5 : 0,
          enabled: Boolean(entity() && enable()),
        }).result$;
      })
    );
  }

  getTimesheetTemplateHeaders(
    userId: WritableSignal<string | null> | Signal<string | null>,
    entity: WritableSignal<string | null> | Signal<string | null>,
    enable = signal(true)
  ) {
    return this.signalsToObservable([userId, entity, enable]).pipe(
      switchMap(() => {
        const isTemplate = true;
        return this.useQuery({
          queryKey: [
            'timesheet-template-headers',
            userId(),
            entity(),
            isTemplate,
          ],
          queryFn: () => {
            return this.timesheetDetailService.getTimesheetHeaders$Json({
              entity: entity()!,
              userId: userId() ?? undefined,
              isTemplate,
            });
          },
          enabled: Boolean(entity() && enable()),
        }).result$;
      })
    );
  }

  deleteHeaders() {
    return this.mutation(
      (headerIds: number[]) => {
        return this.timesheetDetailService.deleteTimesheet({ body: headerIds });
      },
      {
        onSuccess: () => {
          this.queryClient.invalidateQueries(['timesheet-headers']);
          this.queryClient.invalidateQueries(['timesheet-template-headers']);
        },
      }
    );
  }

  approval(
    headerId: WritableSignal<number | undefined> | Signal<number | undefined>
  ) {
    return this.mutation(
      (forApproval: TimesheetApprovalRequest) => {
        return this.timesheetDetailService.timesheetApproval({
          action: forApproval.action,
          detailId: forApproval.detailId,
          headerId: forApproval.headerId,
          remarks: forApproval.remarks,
        });
      },
      {
        onSuccess: () => {
          this.queryClient.invalidateQueries(['timesheet-headers']);
          this.queryClient.invalidateQueries([
            'current-timesheet-header',
            headerId(),
          ]);
          this.queryClient.invalidateQueries([
            'timesheet-header-details',
            headerId(),
          ]);
        },
      }
    );
  }

  getHeaderById(
    headerId: WritableSignal<number | null> | Signal<number | null>,
    enable = signal(true)
  ) {
    return this.signalsToObservable([headerId, enable]).pipe(
      switchMap(() => {
        return this.useQuery({
          queryKey: ['current-timesheet-header', headerId()],
          queryFn: () => {
            return this.timesheetDetailService.getTimesheetHeaderById$Json({
              id: headerId()!,
            });
          },
          enabled: Boolean(headerId() && enable()),
        }).result$;
      })
    );
  }

  getTimesheetDetails(
    headerId: WritableSignal<number | undefined> | Signal<number | undefined>,
    enable = signal(true)
  ) {
    return this.signalsToObservable([headerId, enable]).pipe(
      switchMap(() => {
        return this.useQuery({
          queryKey: ['timesheet-header-details', headerId()],
          queryFn: () => {
            return this.timesheetDetailService.getTimesheetDetails$Json({
              HeaderId: `${headerId()}`,
            });
          },
          enabled: Boolean(headerId() && enable()),
        }).result$;
      })
    );
  }

  saveTimesheetDetails(
    headerId: WritableSignal<number> | Signal<number>,
    successCallback?: (newId: number) => void
  ) {
    return this.mutation(
      (timesheetDetails: TimesheetDetailDto[]) => {
        this.debouceSaveTimesheetDetails(
          timesheetDetails,
          headerId(),
          successCallback
        );
        return of([]);
      },
      {
        onMutate: async newDetails => {
          this.optimisticUpdateTimesheetDetails(newDetails, headerId());
        },
      }
    );
  }

  private debouceSaveTimesheetDetails = debounce(
    (
      timesheetDetails: TimesheetDetailDto[],
      headerId: number,
      successCallback?: (newId: number) => void
    ) => {
      this.timesheetDetailService
        .saveTimesheetDetail({
          body: timesheetDetails,
        })
        .subscribe(res => {
          const hasCreated = timesheetDetails.some(x => !x.TMDetailID);
          if (hasCreated) {
            this.queryClient.invalidateQueries([
              'timesheet-header-details',
              headerId,
            ]);
            this.queryClient.invalidateQueries([
              'current-timesheet-header',
              headerId,
            ]);
          }

          // TODO: Should only invalidate a specific user
          this.queryClient.invalidateQueries(['timesheet-headers']);

          const newId = res as unknown as number;
          if (newId) {
            successCallback?.(newId);
          }
        });
    },
    500
  );

  private async optimisticUpdateTimesheetDetails(
    newDetails: TimesheetDetailDto[],
    headerId: number
  ): Promise<{
    timesheets: TimesheetDetailDto[];
  }> {
    const timesheets = this.queryClient.getQueryData([
      'timesheet-header-details',
      headerId,
    ]) as TimesheetDetailDto[];

    newDetails.forEach(newDetail => {
      const oldIndex = timesheets.findIndex(
        x => x.TMDetailID === newDetail.TMDetailID
      );
      timesheets[oldIndex] = newDetail;
    });

    this.updateTimesheetDetailsCache(headerId, timesheets);

    return { timesheets };
  }

  private async optimisticTimesheetDetailsDelete(
    detailIds: number[],
    headerId: number
  ): Promise<{
    timesheets: TimesheetDetailDto[];
  }> {
    const timesheets = this.queryClient.getQueryData([
      'timesheet-header-details',
      headerId,
    ]) as TimesheetDetailDto[];

    this.updateTimesheetDetailsCache(
      headerId,
      timesheets.filter(x => !detailIds.includes(x.TMDetailID!))
    );

    return { timesheets };
  }

  private updateTimesheetDetailsCache(
    headerId: number,
    timesheets: TimesheetDetailDto[]
  ): void {
    this.queryClient.setQueryData(
      ['timesheet-header-details', headerId],
      () => {
        return timesheets;
      }
    );

    const totalHours = timesheets.reduce((total, x) => {
      return (x.Hours || 0) + total;
    }, 0);

    const timesheetHeader = this.queryClient.getQueryData([
      'current-timesheet-header',
      headerId,
    ]) as TimesheetHeaderDto;
    this.queryClient.setQueryData(
      ['current-timesheet-header', headerId],
      () => {
        return {
          ...timesheetHeader,
          TMTotalHours: totalHours,
        };
      }
    );
  }

  getEmployeeNoTimesheet(
    dateRange:
      | WritableSignal<(string | undefined | null)[]>
      | Signal<(string | undefined | null)[]>,
    enable = signal(true)
  ) {
    return this.signalsToObservable([dateRange, enable]).pipe(
      switchMap(() => {
        return this.useQuery({
          queryKey: ['employees-no-timesheet-header', dateRange()],
          queryFn: () => {
            return this.timesheetDetailService.getEmployeeNoTimesheet$Json({
              dateFrom: dateRange()[0] || undefined,
              dateTo: dateRange()[1] || undefined,
            });
          },
          enabled: Boolean(!dateRange().some(x => !x) && enable()),
        }).result$;
      })
    );
  }
}
