import { TimesheetDetailDto } from '../../api';

export interface WeekDayUi {
  name: string;
  date: Date;
}

export interface TimeSheetUi {
  project: string;
  task: string;
  times: TimesheetDetailDto[];
  orderNumber?: number;
}

export type WeekViewUi = 'weekdays' | 'week' | 'daily' | 'report';

export enum TimesheetStatus {
  All = '',
  Saved = 'Saved',
  Submitted = 'Submitted',
  Return = 'Returned',
  Approved = 'Approved',
  Posted = 'Posted',
  Reviewing = 'Reviewing',
}
