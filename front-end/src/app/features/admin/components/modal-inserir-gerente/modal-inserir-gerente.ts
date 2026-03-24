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
    celular: ['', Validators.required],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });

  emitirFechamento(): void {
    this.fechar.emit();
  }

  removerNumerosDoNome(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorSemNumeros = input.value.replace(/[0-9]/g, '');
    
    this.formulario.controls.nome.setValue(valorSemNumeros, { emitEvent: false });
    input.value = valorSemNumeros;
  }


  emitirSalvamento(): void {
    if (this.formulario.valid) {
      const dadosFormulario = this.formulario.getRawValue();
      
      const removeNonDigits = (value: string) => value.replace(/\D/g, '');

      const requestData = {
        ...dadosFormulario,
        cpf: removeNonDigits(dadosFormulario.cpf),
      };

      this.salvar.emit(requestData);
    } else {
      this.formulario.markAllAsTouched();
    }
  }
}