import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { provideNgxMask } from 'ngx-mask';

import { SignupPageComponent } from './signup-page.component';
import { ViaCepService } from '../../../services/viacep.service';
import { ToastService } from '../../../services/toast.service';
import { ClienteService } from '../../../services/cliente.service';

describe('SignupPageComponent', () => {
  let component: SignupPageComponent;
  let fixture: ComponentFixture<SignupPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupPageComponent],
      providers: [
        provideRouter([]),
        provideNgxMask(),
        {
          provide: ClienteService,
          useValue: {
            criarCliente: jasmine.createSpy('criarCliente').and.returnValue(of(void 0)),
          },
        },
        {
          provide: ViaCepService,
          useValue: {
            buscarCep: jasmine.createSpy('buscarCep').and.returnValue(of()),
          },
        },
        {
          provide: ToastService,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
