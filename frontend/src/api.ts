import axios from "axios";

// Base URLs for the backend services
const USER_SERVICE_URL = "http://localhost:8081"; // User Service
const REPORT_SERVICE_URL = "http://localhost:8082"; // Report Service

// API client for submitting users
export const submitUser = async (userData: any): Promise<any> => {
    try {
        const response = await axios.post(`${USER_SERVICE_URL}/api/submit-user`, userData);
        return response.data;
    } catch (error) {
        console.error("Error submitting user:", error);
        throw error;
    }
};

// API client for generating reports
export const generateReport = async (): Promise<any> => {
    try {
        const response = await axios.get(`${REPORT_SERVICE_URL}/api/generate-report`);
        return response.data;
    } catch (error) {
        console.error("Error generating report:", error);
        throw error;
    }
};
