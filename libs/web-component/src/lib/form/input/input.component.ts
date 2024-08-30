import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  effect,
  input,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BtpFormGroup, BtpInputType, FormOutput, FormValidity } from '../types';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  remixAddLine as add,
  remixMore2Line as more,
  remixEyeLine as eye,
  remixEyeOffLine as eyeClose,
} from '@ng-icons/remixicon';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { uniqueId } from 'lodash';
import { ModalComponent } from '../../modal/modal.component';
import { combineLatest, skip, tap } from 'rxjs';
import { DateTime } from 'luxon';

@Component({
  selector: 'btp-input',
  standalone: true,
  imports: [
    NgIconComponent,
    ReactiveFormsModule,
    NgSelectModule,
    ModalComponent,
  ],
  templateUrl: './input.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ add, more, eye, eyeClose })],
})
export class InputComponent {
  input = input.required<BtpFormGroup<never>>();
  markAsPristineCount = input(0);
  options = input<unknown[]>([]);
  resetCount = input(0);
  isDisabled = input(false);

  @Output() valueChange = new EventEmitter<FormOutput>();
  @Output() isValidChange = new EventEmitter<FormValidity>();

  INPUT_TYPE = BtpInputType;

  inputControl = new FormControl<unknown>(null);

  value = toSignal(this.inputControl.valueChanges);
  passwordVisible = signal(false);

  watchValue = effect(() => {
    if (!this.input().field) {
      return;
    }
    const inputValue = this.value();

    // Emit the value change of the input control
    if (this.inputControl.dirty) {
      this.valueChange.emit({
        [this.input().field as string]: inputValue,
      });

      this.emitInputValidity();
    }
  });

  inputId = uniqueId();

  isLookupModalOpen = signal<boolean>(false);
  isUserModalOpen = signal<boolean>(false);
  isOpen = signal<boolean>(false);

  input$ = toObservable(this.input).pipe(
    tap(input => {
      this.inputControl.setValidators([
        ...(input.required ? [Validators.required] : []),
      ]);
      this.inputControl.setValue(null);
      this.inputControl.setValue(this.formatValues(input.value));

      this.emitInputValidity();
    })
  );

  markAsPristineCount$ = toObservable(this.markAsPristineCount).pipe(
    tap(() => this.inputControl.markAsPristine())
  );

  resetCount$ = toObservable(this.resetCount).pipe(
    skip(1),
    tap(() => {
      this.inputControl.setValue(null);
    })
  );

  isDisabled$ = toObservable(this.isDisabled).pipe(
    tap(isDisabled => {
      if (isDisabled) {
        this.inputControl.disable({ emitEvent: false });
      } else {
        this.inputControl.enable({ emitEvent: false });
      }
    })
  );

  constructor() {
    combineLatest([
      this.input$,
      this.markAsPristineCount$,
      this.resetCount$,
      this.isDisabled$,
    ]).subscribe();
  }

  formatValues(value: unknown): unknown {
    if (this.input().type === BtpInputType.date) {
      return DateTime.fromJSDate(new Date(value as Date)).toFormat(
        'yyyy-MM-dd'
      );
    }
    return value;
  }

  emitInputValidity(): void {
    this.isValidChange.emit({
      [this.input().field as string]: this.inputControl.valid,
    });
  }

  searchFn(term: string, item: { [key: string]: string }): boolean {
    if (!this.input().optionLabel || !this.input().optionValue) {
      return false;
    }
    return (
      item[this.input().optionLabel!].toLowerCase().indexOf(term) > -1 ||
      item[this.input().optionValue!].toLowerCase().indexOf(term) > -1
    );
  }
}
