export interface Address {
  subject: string;
  details: string;
}

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  gender: string;
  persian_date: string;
  created_at: string;
  deleted_at: string | null;
}

export interface WeeklyGenderStats {
  week: number;
  male_count: number;
  female_count: number;
}

export interface MonthlyGenderStats {
  persian_date: string;
  male_count: number;
  female_count: number;
}

export interface ReportData {
  WeeklyStats: WeeklyGenderStats[];
  MonthlyStats: MonthlyGenderStats[];
}

