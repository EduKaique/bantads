import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputPrimaryComponent } from '../../../../shared/components/input-primary/input-primary.component';

@Component({
  selector: 'app-modal-inserir-gerente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputPrimaryComponent],
  templateUrl: './modal-inserir-gerente.html',
  styleUrl: './modal-inserir-gerente.css'
})
export class ModalInserirGerenteComponent {
  private formBuilder = inject(FormBuilder);

  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<any>();

  formulario = this.formBuilder.nonNullable.group({
    nome: ['', Validators.required],
    cpf: ['', [Validators.required, Validators.minLength(11)]],
    email: ['', [Validators.required, Validators.email]],
    telefone: ['', Validators.required],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });

  emitirFechamento(): void {
    this.fechar.emit();
  }

  emitirSalvamento(): void {
    if (this.formulario.valid) {
      this.salvar.emit(this.formulario.getRawValue());
    } else {
      this.formulario.markAllAsTouched();
    }
  }
}