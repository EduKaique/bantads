import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideNgxMask } from 'ngx-mask';

import { InputPrimaryComponent } from './input-primary.component';

describe('InputPrimaryComponent', () => {
  let component: InputPrimaryComponent;
  let fixture: ComponentFixture<InputPrimaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputPrimaryComponent, ReactiveFormsModule],
      providers: [provideNgxMask(), FormControl],
    }).compileComponents();

    fixture = TestBed.createComponent(InputPrimaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
