export enum PerksType {
  Award = 'Award',
  Benefits = 'Benefits'
}


export interface Perks {
  perksId: number;
  employeeId: number;
  perksType: PerksType;
  datePerks: Date;
  reason: string;
}
