import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from './input/input.component';
import {
  BtpFormAsyncOptions,
  BtpFormGroup,
  BtpInputType,
  FormOutput,
  FormValidity,
} from './types';
import { GroupComponent } from './group/group.component';
import { debounce } from 'lodash';

@Component({
  selector: 'btp-form',
  standalone: true,
  imports: [CommonModule, InputComponent, GroupComponent],
  templateUrl: './form.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent {
  isDisabled = input(false);
  form = input<BtpFormGroup<never>[]>([]);
  isShowMore = input(false);
  debounce = input(300);
  markAsPristineCount = input(0);
  resetCount = input(0);
  // Todo: add this as part of BtpFormGroup
  formOptions = input<BtpFormAsyncOptions>({});

  @Output() valueChange = new EventEmitter<FormOutput>();
  @Output() isValidChange = new EventEmitter<boolean>();
  @Output() isInputValidtyChange = new EventEmitter<FormValidity>();

  formOutput: FormOutput = {};
  formValidity: FormValidity = {};

  inputType = BtpInputType;

  debounceEmitNewValue = debounce(() => {
    this.valueChange.emit(this.formOutput);
  });

  debounceEmitValidity = debounce(() => {
    let invalidCount = 0;
    for (const key in this.formValidity) {
      if (!this.formValidity[key]) {
        invalidCount++;
      }
    }
    this.isValidChange.emit(!invalidCount);
  });

  onValueChange(changed: FormOutput): void {
    this.formOutput = {
      ...this.formOutput,
      ...changed,
    };
    this.debounceEmitNewValue();
  }

  onIsValidChange(changed: FormValidity): void {
    this.formValidity = {
      ...this.formValidity,
      ...changed,
    };
    this.isInputValidtyChange.emit(this.formValidity);
    this.debounceEmitValidity();
  }

  getOptions(key?: string | number | symbol): unknown[] {
    if (!key) {
      return [];
    }
    return this.formOptions()[key as string];
  }
}
