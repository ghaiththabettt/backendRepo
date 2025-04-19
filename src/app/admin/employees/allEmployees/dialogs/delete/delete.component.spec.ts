import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AllEmployeesDeleteComponent } from './delete.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('AllEmployeesDeleteComponent', () => {
  let component: AllEmployeesDeleteComponent;
  let fixture: ComponentFixture<AllEmployeesDeleteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AllEmployeesDeleteComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllEmployeesDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
