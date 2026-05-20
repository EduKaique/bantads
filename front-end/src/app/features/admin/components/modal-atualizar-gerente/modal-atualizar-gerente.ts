import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnChanges, SimpleChanges, Input } from '@angular/core';
import { DadoGerenteAtualizacao, Gerente } from '../../../../shared/models/gerente';

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

  @Input() gerente: Gerente | null = null;

  private formBuilder = inject(FormBuilder);


  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<DadoGerenteAtualizacao>();

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
      const payload: DadoGerenteAtualizacao = {};

      if (form.nome) payload.nome = form.nome;
      if (form.email) payload.email = form.email;
      if (form.senha) payload.senha = form.senha;
      this.salvar.emit(payload);
    }
  }
}
