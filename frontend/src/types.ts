// types.ts
export interface Address {
    id?: number;
    subject: string;
    details: string;
}

export interface User {
    id: number;
    firstname: string;
    lastname: string;
    phone_number: string;
    gender: string;
    persian_date: string;
    created_at: string;
    deleted_at: string | null;
    addresses?: Address[];
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

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface EditedAddresses {
  [key: number]: Address;
}

export interface UserResponse extends ApiResponse<User> {}
export interface UsersResponse extends ApiResponse<User[]> {}
export interface AddressResponse extends ApiResponse<Address> {}
export interface AddressesResponse extends ApiResponse<Address[]> {}
