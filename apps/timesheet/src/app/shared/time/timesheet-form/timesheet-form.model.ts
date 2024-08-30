import { TimesheetDetailDto } from '@grant/data-service';

export interface TimesheetForm extends TimesheetDetailDto {
  isEntireWeek: boolean;
}
