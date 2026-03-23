import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnChanges, SimpleChanges, Input } from '@angular/core';

@Component({
  selector: 'app-modal-atualizar-gerente',
  imports: [
    CommonModule, 
    ReactiveFormsModule
  ],
  templateUrl: './modal-atualizar-gerente.html',
  styleUrl: './modal-atualizar-gerente.css',
})
export class ModalAtualizarGerente implements OnChanges {

  @Input() gerente: any;

  private formBuilder = inject(FormBuilder);


  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<any>();

  formulario = this.formBuilder.nonNullable.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.minLength(6)]]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gerente'] && this.gerente) {
      this.formulario.patchValue({
        nome: this.gerente.nome,
        email: this.gerente.email,
        senha: ''
      });

      this.formulario.markAsPristine();
      this.formulario.markAsUntouched();
    }
  }

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
    if (this.formulario.valid && !this.formulario.pristine) {
      const form = this.formulario.getRawValue();
      const payload: any = {};

      if (form.nome) payload.name = form.nome;
      if (form.email) payload.email = form.email;
      if (form.senha) payload.password = form.senha;
      this.salvar.emit(payload);
    }
  }
}