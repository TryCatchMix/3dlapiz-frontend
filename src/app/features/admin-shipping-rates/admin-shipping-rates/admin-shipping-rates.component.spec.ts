import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminShippingRatesComponent } from './admin-shipping-rates.component';

describe('AdminShippingRatesComponent', () => {
  let component: AdminShippingRatesComponent;
  let fixture: ComponentFixture<AdminShippingRatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminShippingRatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminShippingRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
