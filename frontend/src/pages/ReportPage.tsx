import React, { useEffect, useState } from "react";
import { generateReport } from "../api"; // Use the correct function name
import { ReportData, GenderStats } from "../types";

function ReportPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await generateReport(); // Call the correct function
        setReportData(data);
      } catch (error) {
        console.error("Failed to fetch report data:", error);
      }
    };
    fetchData();
  }, []);

  if (!reportData) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Weekly Stats</h2>
      <table>
        <thead>
          <tr>
            <th>Week/Month</th>
            <th>Male Count</th>
            <th>Female Count</th>
            <th>Male %</th>
            <th>Female %</th>
          </tr>
        </thead>
        <tbody>
          {reportData.WeeklyStats.map((stat: GenderStats, index: number) => (
            <tr key={index}>
              <td>{stat.week_or_month}</td>
              <td>{stat.male_count}</td>
              <td>{stat.female_count}</td>
              <td>{stat.male_percentage.toFixed(2)}%</td>
              <td>{stat.female_percentage.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Monthly Stats</h2>
      <table>
        <thead>
          <tr>
            <th>Week/Month</th>
            <th>Male Count</th>
            <th>Female Count</th>
            <th>Male %</th>
            <th>Female %</th>
          </tr>
        </thead>
        <tbody>
          {reportData.MonthlyStats.map((stat: GenderStats, index: number) => (
            <tr key={index}>
              <td>{stat.week_or_month}</td>
              <td>{stat.male_count}</td>
              <td>{stat.female_count}</td>
              <td>{stat.male_percentage.toFixed(2)}%</td>
              <td>{stat.female_percentage.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReportPage;
