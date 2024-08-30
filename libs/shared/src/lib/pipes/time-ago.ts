import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'timeAgo',
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  transform(date?: Date | string, locale?: string): string {
    if (!date) {
      return '';
    }

    const utcDate = DateTime.fromJSDate(new Date(date), { zone: 'utc' });

    return (
      utcDate.toRelative({
        base: DateTime.now(),
        locale: locale,
      }) || ''
    );
  }
}
