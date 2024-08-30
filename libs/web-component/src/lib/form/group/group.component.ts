import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  input,
} from '@angular/core';
import {
  BtpFormAsyncOptions,
  BtpFormGroup,
  BtpInputType,
  FormValidity,
} from '../types';
import { InputComponent } from '../input/input.component';
import { FormComponent } from '../form.component';
import { FormOutput } from '../types';

@Component({
  selector: 'btp-group',
  standalone: true,
  imports: [InputComponent, FormComponent],
  templateUrl: './group.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupComponent {
  form = input<BtpFormGroup<never>>();
  formOptions = input<BtpFormAsyncOptions>({});
  isShowMore = input(false);
  markAsPristineCount = input(0);
  resetCount = input(0);
  isDisabled = input(false);

  @Output() valueChange = new EventEmitter<FormOutput>();
  @Output() isValidChange = new EventEmitter<FormValidity>();

  inputType = BtpInputType;

  onValueChange(changed: FormOutput): void {
    this.valueChange.emit(changed);
  }

  onIsValidChange(isValid: FormValidity): void {
    this.isValidChange.emit(isValid);
  }
}
