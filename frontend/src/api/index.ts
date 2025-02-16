// api/index.ts
import axios from "axios";
import { User, Address } from "../types";

const USER_SERVICE_URL = "http://localhost:8081";
const REPORT_SERVICE_URL = "http://localhost:8082";

// Get all users
export const getUsers = async () => {
    try {
        const response = await axios.get(`${USER_SERVICE_URL}/api/users`);
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

// Get user by ID
export const getUserById = async (id: number) => {
    try {
        const response = await axios.get(`${USER_SERVICE_URL}/api/users/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
};

// Submit new user
export const submitUser = async (userData: Omit<User, 'id' | 'created_at' | 'deleted_at'>) => {
    try {
        const response = await axios.post(`${USER_SERVICE_URL}/api/submit-user`, userData);
        return response.data;
    } catch (error) {
        console.error("Error submitting user:", error);
        throw error;
    }
};

// Get user addresses
export const getUserAddresses = async (userId: number) => {
    try {
        const response = await axios.get(`${USER_SERVICE_URL}/api/users/${userId}/addresses`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user addresses:", error);
        throw error;
    }
};

// Add address to user
export const addUserAddress = async (userId: number, address: Address) => {
    try {
        const response = await axios.post(
            `${USER_SERVICE_URL}/api/users/${userId}/addresses`,
            address
        );
        return response.data;
    } catch (error) {
        console.error("Error adding address:", error);
        throw error;
    }
};

// Get user stats
export const getUserStats = async (year: string, month: string) => {
    try {
        console.log('Fetching user stats for:', year, month);
        const response = await axios.get(`${USER_SERVICE_URL}/api/user-stats`, {
            params: { year, month },
        });
        console.log('User stats response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching user stats:", error);
        throw error;
    }
};

// Generate report
export const generateReport = async () => {
    try {
        console.log('Calling Report API...');
        const response = await axios.get(`${REPORT_SERVICE_URL}/api/report`);
        console.log('Report API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error generating report:", error);
        throw error;
    }
};
