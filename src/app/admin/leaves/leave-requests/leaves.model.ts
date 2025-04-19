import { formatDate } from '@angular/common';

export class Leaves {
  id: number; // Corresponds to leaveId in backend
  img: string | null; // Comes from Employee entity in backend
  name: string; // Comes from Employee entity in backend
  employeeId: number; // Corresponds to employeeId in backend DTO
  department: string; // Comes from Employee entity in backend
  type: string; // Corresponds to leaveType enum in backend
  from: string; // Corresponds to startDate in backend
  leaveTo: string; // Corresponds to endDate in backend
  noOfDays: number; // Corresponds to numberOfDays in backend
  durationType: string; // Corresponds to durationType enum in backend
  status: string; // Corresponds to statusLeave enum in backend
  reason: string;
  note: string;
  requestedOn: string;
  approvedBy: string | null; // Comes from User entity (name) in backend
  approvalDate: string | null; // Corresponds to approvalDate in backend

  constructor(leaves: Partial<Leaves>) {
    // Defaults are less critical now as data primarily comes from backend
    this.id = leaves.id || 0; // Backend will assign ID on creation
    this.img = leaves.img || 'assets/images/user/user.png'; // Default/placeholder
    this.name = leaves.name || '';
    this.employeeId = leaves.employeeId || 0;
    this.department = leaves.department || '';
    this.type = leaves.type || '';
    this.from = leaves.from || formatDate(new Date(), 'yyyy-MM-dd', 'en');
    this.leaveTo = leaves.leaveTo || formatDate(new Date(), 'yyyy-MM-dd', 'en');
    this.noOfDays = leaves.noOfDays || 0;
    this.durationType = leaves.durationType || 'FULL_DAY'; // Match backend enum?
    this.status = leaves.status || 'PENDING'; // Match backend enum?
    this.reason = leaves.reason || '';
    this.note = leaves.note || '';
    this.requestedOn = leaves.requestedOn || formatDate(new Date(), 'yyyy-MM-dd', 'en');
    this.approvedBy = leaves.approvedBy || null;
    this.approvalDate = leaves.approvalDate || null;
  }

  // getRandomID is no longer needed as backend handles IDs
  // public getRandomID(): number {
  //   const S4 = () => {
  //     return ((1 + Math.random()) * 0x10000) | 0;
  //   };
  //   return S4() + S4();
  // }
}

// Interface matching the Backend DTO structure for clarity
export interface LeaveDTO {
  leaveId: number;
  employeeId: number;
  employeeName: string;
  employeeImg: string | null;
  departmentName: string;
  leaveType: string; // e.g., "ANNUAL", "SICK"
  startDate: string; // "yyyy-MM-dd"
  endDate: string; // "yyyy-MM-dd"
  numberOfDays: number; // Java utilise Double, TS utilise number
  durationType: string; // e.g., "FULL_DAY", "HALF_DAY"
  statusLeave: string; // e.g., "PENDING", "APPROVED", "REJECTED"
  reason: string;
  note: string;
  requestedOn: string; // "yyyy-MM-dd"
  actionedById: number | null;   // <-- Changer ici
  actionedByName: string | null; // <-- Changer ici
  actionDate: string | null;     // <-- Changer ici (garder string | null car LocalDate devient
}