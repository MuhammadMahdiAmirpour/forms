// Address represents the structure of an address associated with a user.
export interface Address {
  subject: string; // Subject of the address (e.g., "Home", "Work")
  details: string; // Details of the address
}

// User represents the structure of a user submitted via the API.
export interface User {
  firstname: string; // User's first name
  lastname: string; // User's last name
  gender: 'Male' | 'Female'; // User's gender (e.g., "Male", "Female")
  persian_date: string; // Persian date entered by the user (e.g., "1403/02/09")
  addresses: Address[]; // List of user addresses
}

// GenderStats represents statistics grouped by week or month.
export interface GenderStats {
  week_or_month: string; // Week or month identifier (e.g., "Week 1" or "2023-02")
  male_count: number; // Number of males
  female_count: number; // Number of females
  male_percent: number; // Percentage of males
  female_percent: number; // Percentage of females
}

// WeeklyGenderStats represents statistics for a specific week.
export interface WeeklyGenderStats {
  week: number; // Week number
  male_count: number; // Number of males
  female_count: number; // Number of females
}

// MonthlyGenderStats represents statistics for a specific month.
export interface MonthlyGenderStats {
  persian_date: string; // Persian date for the month
  male_count: number; // Number of males
  female_count: number; // Number of females
}

// ReportData represents the complete report data structure.
export interface ReportData {
  WeeklyStats: WeeklyGenderStats[]; // List of weekly statistics
  MonthlyStats: MonthlyGenderStats[]; // List of monthly statistics
}
