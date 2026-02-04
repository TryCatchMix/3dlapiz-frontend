import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatreonComponent } from './patreon.component';

describe('PatreonComponent', () => {
  let component: PatreonComponent;
  let fixture: ComponentFixture<PatreonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatreonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatreonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
