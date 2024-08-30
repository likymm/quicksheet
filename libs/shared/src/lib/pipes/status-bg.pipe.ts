import { Pipe, PipeTransform } from '@angular/core';
import { TimesheetStatus } from '@grant/data-service';

@Pipe({
  name: 'statusBG',
  standalone: true,
})
export class StatusBgPipe implements PipeTransform {
  transform(status?: TimesheetStatus | null | string): string {
    if (
      status === TimesheetStatus.Approved ||
      status === TimesheetStatus.Posted
    ) {
      return 'badge-success';
    } else if (status === TimesheetStatus.Return) {
      return 'badge-error';
    }
    return 'badge-info';
  }
}
