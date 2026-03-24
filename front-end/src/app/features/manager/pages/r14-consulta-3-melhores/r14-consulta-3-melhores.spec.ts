import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MelhoresClientesService } from '../../services/melhores-clientes.service';
import { R14Consulta3MelhorComponent } from './r14-consulta-3-melhores';

describe('R14Consulta3MelhorComponent', () => {
  let component: R14Consulta3MelhorComponent;
  let fixture: ComponentFixture<R14Consulta3MelhorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [R14Consulta3MelhorComponent],
      providers: [
        provideRouter([]),
        {
          provide: MelhoresClientesService,
          useValue: {
            obter3MelhoresClientes: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(R14Consulta3MelhorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});
