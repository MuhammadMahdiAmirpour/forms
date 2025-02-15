import axios from "axios";

const USER_SERVICE_URL = "http://localhost:8081";
const REPORT_SERVICE_URL = "http://localhost:8082";

// First, ensure your API function returns the complete response:
export const submitUser = async (userData: User) => {
    const response = await fetch(`${USER_SERVICE_URL}/api/submit-user`, {  // Update port to match your backend
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    return data;
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

