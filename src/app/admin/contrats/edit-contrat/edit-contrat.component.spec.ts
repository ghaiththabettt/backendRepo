import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditContratComponent } from './edit-contrat.component';

describe('EditContratComponent', () => {
  let component: EditContratComponent;
  let fixture: ComponentFixture<EditContratComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditContratComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditContratComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
