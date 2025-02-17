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

// Submit or edit user
export const submitUser = async (userData: User) => {
    try {
        if (userData.id) {
            // Edit existing user
            const response = await axios.put(
                `${USER_SERVICE_URL}/api/users/${userData.id}`,
                {
                    user: userData,
                    addresses: userData.addresses
                }
            );
            return response.data;
        } else {
            // Create new user
            const response = await axios.post(
                `${USER_SERVICE_URL}/api/users`,
                userData
            );
            return response.data;
        }
    } catch (error) {
        console.error("Error submitting/editing user:", error);
        throw error;
    }
};

// Edit address
export const editAddress = async (userId: number, addressId: number, address: Address) => {
  try {
    const response = await fetch(`/api/users/${userId}/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(address),
    });

    if (!response.ok) {
      throw new Error(`Failed to update address: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Edit address error:', error);
    throw error;
  }
};

// Delete address
export const deleteAddress = async (userId: number, addressId: number) => {
  try {
    const response = await fetch(`/api/users/${userId}/addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete address: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Delete address error:', error);
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
