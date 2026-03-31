import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardGerenteDashboardComponent } from './card-gerente-dashboard';

describe('CardGerenteDashboardComponent', () => {
  let component: CardGerenteDashboardComponent;
  let fixture: ComponentFixture<CardGerenteDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardGerenteDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardGerenteDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
