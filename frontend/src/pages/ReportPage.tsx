import React, { useState, useEffect } from "react";
import { getUserStats } from "../api";
import styles from "../styles/ReportPage.module.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function ReportPage() {
  const [userStats, setUserStats] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  useEffect(() => {
    if (selectedYear && selectedMonth) {
      fetchUserStats(selectedYear, selectedMonth);
    }
  }, [selectedYear, selectedMonth]);

  const fetchUserStats = async (year: string, month: string) => {
    try {
      const data = await getUserStats(year, month);
      setUserStats(data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };

  return (
    <div className={styles.container}>
      <h2>Monthly User Statistics</h2>
      <label className={styles.label}>
        Year:
        <select value={selectedYear} onChange={handleYearChange} className={styles.select}>
          <option value="">Select Year</option>
          <option value="1400">1400</option>
          <option value="1401">1401</option>
          <option value="1402">1402</option>
        </select>
      </label>
      <label className={styles.label}>
        Month:
        <select value={selectedMonth} onChange={handleMonthChange} className={styles.select}>
          <option value="">Select Month</option>
          <option value="01">Farvardin</option>
          <option value="02">Ordibehesht</option>
          <option value="03">Khordad</option>
          <option value="04">Tir</option>
          <option value="05">Mordad</option>
          <option value="06">Shahrivar</option>
          <option value="07">Mehr</option>
          <option value="08">Aban</option>
          <option value="09">Azar</option>
          <option value="10">Dey</option>
          <option value="11">Bahman</option>
          <option value="12">Esfand</option>
        </select>
      </label>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={userStats}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="persian_date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" name="Number of Users" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ReportPage;
