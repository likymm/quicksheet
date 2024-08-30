import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  TemplateRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { remixCloseLine as close } from '@ng-icons/remixicon';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'btp-modal',
  standalone: true,
  imports: [TranslocoModule, NgIconComponent, CommonModule],
  templateUrl: './modal.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ close })],
})
export class ModalComponent {
  @ContentChild('header', { read: TemplateRef })
  headerTemplate!: TemplateRef<unknown>;

  @ContentChild('footer', { read: TemplateRef })
  footerTemplate!: TemplateRef<unknown>;

  _open = signal<boolean>(false);

  title = input('');
  boxClass = input('');
  okClass = input('');
  open = input(false);
  disabledOk = input(false);

  @Output() openChange = new EventEmitter<boolean>();
  @Output() ok = new EventEmitter<void>();

  @HostListener('document:keydown.escape', ['$event'])
  onEscKeyDown(): void {
    this._open.set(false);
    this.openChange.emit(false);
  }

  modalAction = viewChild<ElementRef<HTMLElement>>('modalAction');
  modalBody = viewChild<ElementRef<HTMLElement>>('modalBody');

  constructor() {
    toObservable(this.open).subscribe(isOpen => {
      this._open.set(isOpen);

      if (isOpen) {
        this.focusOnFirstInput();
      }
    });
  }

  backdropClicked(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  closeModal() {
    this._open.set(false);
    this.openChange.emit(false);
  }

  onOk(): void {
    this.ok.emit();
    this.closeModal();
  }

  focusOnFirstInput(): void {
    setTimeout(() => {
      const firstInput = this.modalBody()
        ?.nativeElement.querySelectorAll('input, textarea, select')
        .item(0) as HTMLInputElement | undefined;

      if (firstInput) {
        firstInput?.focus();
      } else {
        (
          this.modalAction()?.nativeElement.querySelector(
            'button:last-child'
          ) as HTMLButtonElement
        ).focus();
      }
    });
  }
}
