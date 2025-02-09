// Address represents the structure of an address associated with a user.
export interface Address {
  subject: string; // Subject of the address (e.g., "Home", "Work")
  details: string; // Details of the address
}

// User represents the structure of a user submitted via the API.
export interface User {
  firstname: string; // User's first name
  lastname: string; // User's last name
  gender: string; // User's gender (e.g., "Male", "Female")
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

// ReportData represents the structure of the report data returned by the API.
export interface ReportData {
  WeeklyStats: GenderStats[]; // Statistics grouped by week
  MonthlyStats: GenderStats[]; // Statistics grouped by month
}
