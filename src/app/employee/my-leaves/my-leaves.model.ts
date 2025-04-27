// src/app/employee/my-leaves/my-leaves.model.ts
import { formatDate } from '@angular/common';

export class MyLeaves {
  id: number;
  applyDate: string;
  fromDate: string;
  toDate: string;
  durationType: string; // Changed from halfDay. Expect 'FULL_DAY' or 'HALF_DAY'
  type: string;
  status: string;
  reason: string;

  constructor(myLeaves: Partial<MyLeaves>) {
    this.id = myLeaves.id || 0;
    this.applyDate = myLeaves.applyDate || formatDate(new Date(), 'yyyy-MM-dd', 'en');
    this.fromDate = myLeaves.fromDate || ''; // Default to empty string or null
    this.toDate = myLeaves.toDate || '';   // Default to empty string or null
    this.durationType = myLeaves.durationType || 'FULL_DAY'; // Default to FULL_DAY
    this.reason = myLeaves.reason || '';
    this.type = myLeaves.type || '';
    this.status = myLeaves.status || 'PENDING';
  }
}

// Interface matching the Backend DTO (already correct)
export interface LeaveDTO {
    leaveId: number;
    employeeId: number;
    employeeName: string;
    employeeImg: string | null;
    departmentName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    numberOfDays: number;
    durationType: string; // Expect 'FULL_DAY' or 'HALF_DAY'
    statusLeave: string;
    reason: string;
    note: string;
    requestedOn: string;
    actionedById: number | null;
    actionedByName: string | null;
    actionDate: string | null;
}