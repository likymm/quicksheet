import { Pipe, PipeTransform } from '@angular/core';
import { Duration } from 'luxon';

@Pipe({
  name: 'decimalTimeFormat',
  standalone: true,
})
export class DecimalTimeFormatPipe implements PipeTransform {
  transform(decimalTime = 0): string {
    // Calculate total minutes
    const totalMinutes = decimalTime * 60;

    // Create a Luxon Duration object
    const duration = Duration.fromObject({ minutes: totalMinutes });

    // Extract hours and minutes from the duration
    const hours = Math.floor(duration.as('hours'));
    const minutes = Math.floor(duration.as('minutes') % 60);

    // Format the result as 'HH:mm'
    return `${this.padZero(hours)}:${this.padZero(minutes)}`;
  }

  private padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }
}
