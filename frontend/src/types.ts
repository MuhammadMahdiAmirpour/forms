// types.ts
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
    addresses?: Address[]; // Make addresses optional since they might be loaded separately
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

// New interfaces for API responses
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface UserResponse extends ApiResponse<User> {}
export interface UsersResponse extends ApiResponse<User[]> {}
export interface AddressResponse extends ApiResponse<Address> {}
export interface AddressesResponse extends ApiResponse<Address[]> {}
