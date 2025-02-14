import axios from "axios";

const USER_SERVICE_URL = "http://localhost:8081";
const REPORT_SERVICE_URL = "http://localhost:8082";

export const submitUser = async (userData: any): Promise<any> => {
    try {
        const response = await axios.post(`${USER_SERVICE_URL}/api/submit-user`, userData);
        return response.data;
    } catch (error) {
        console.error("Error submitting user:", error);
        throw error;
    }
};

export const getUserStats = async (year: string, month: string): Promise<any> => {
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

export const generateReport = async (): Promise<any> => {
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

