export enum BtpInputType {
  text = 'text',
  password = 'password',
  textarea = 'textarea',
  number = 'number',
  date = 'date',
  week = 'week',
  checkbox = 'checkbox',
  radio = 'radio',
  multiselect = 'multiselect',
  select = 'select',
  group = 'group',
  userGroup = 'userGroup',
  lookup = 'lookup',
}

export interface BtpFormGroup<T> {
  label?: string;
  type: BtpInputType;
  children?: BtpFormGroup<T>[];
  placeholder?: string;
  required?: boolean;
  charLength?: string;
  inShowMore?: boolean;
  field?: keyof T;
  value?: unknown;
  minDate?: string;
  maxDate?: string;
  optionValue?: string;
  optionLabel?: string;
  hidden?: boolean;
}

export interface BtpFormAsyncOptions {
  [key: string]: unknown[];
}

export type FormOutput = Record<string, unknown>;
export type FormValidity = Record<string, boolean>;
