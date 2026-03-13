import { Component, input, inject, OnInit, signal } from '@angular/core';
import { ControlValueAccessor, NgControl, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-input-primary',
  standalone: true,
  imports: [ReactiveFormsModule, NgxMaskDirective, NgClass],
  templateUrl: './input-primary.component.html',
  styleUrls: ['./input-primary.component.css'],
})
export class InputPrimaryComponent implements ControlValueAccessor, OnInit {
  label = input<string>('');
  inputName = input<string>('');
  placeholder = input<string>('');
  type = input<'text' | 'email' | 'password' | 'number'>('text');
  errorMessage = input<string>('');

  mask = input<string>('');
  prefix = input<string>('');
  thousandSeparator = input<'.' | ',' | ''>('');
  decimalMarker = input<'.' | ','>(',');
  dropSpecialCharacters = input<boolean>(true);

  private ngControl = inject(NgControl, { optional: true, self: true });

  value = signal<any>('');

  onChange: any = () => {};
  onTouched: any = () => {};

  generatedId = `input-${Math.random().toString(36).substring(2, 9)}`;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {}

  get finalId(): string {
    return this.inputName() || this.generatedId;
  }

  get hasError(): boolean {
    return !!(this.ngControl?.invalid && this.ngControl?.touched);
  }

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  onBlur() {
    this.onTouched();
  }

  writeValue(obj: any): void { this.value.set(obj); }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
}