import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CardPedidoAutocadastroComponent } from './card-pedido-autocadastro';

describe('CardPedidoAutocadastroComponent', () => {
  let component: CardPedidoAutocadastroComponent;
  let fixture: ComponentFixture<CardPedidoAutocadastroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPedidoAutocadastroComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardPedidoAutocadastroComponent);
    component = fixture.componentInstance;
    component.pedidoAutocadastro = {
      cpf: '12912861012',
      nome: 'Catharyna',
      salario: 10000,
      dataSolicitacao: '2026-03-14T10:00:00.000Z',
    };
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar os dados do pedido de autocadastro', () => {
    const textoRenderizado = fixture.nativeElement.textContent;

    expect(textoRenderizado).toContain('Catharyna');
    expect(textoRenderizado).toContain('129.128.610-12');
    expect(textoRenderizado).toContain('R$');
    expect(textoRenderizado).toContain('14/03/2026');
  });

  it('deve emitir evento ao clicar em aprovar', () => {
    spyOn(component.aprovar, 'emit');

    const botaoAprovar = fixture.debugElement.queryAll(By.css('button'))[1];
    botaoAprovar.triggerEventHandler('click');

    expect(component.aprovar.emit).toHaveBeenCalledWith(component.pedidoAutocadastro);
  });

  it('deve emitir evento ao clicar em rejeitar', () => {
    spyOn(component.rejeitar, 'emit');

    const botaoRejeitar = fixture.debugElement.queryAll(By.css('button'))[0];
    botaoRejeitar.triggerEventHandler('click');

    expect(component.rejeitar.emit).toHaveBeenCalledWith(component.pedidoAutocadastro);
  });
});
