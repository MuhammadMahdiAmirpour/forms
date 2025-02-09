import React, { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line,
  ResponsiveContainer 
} from 'recharts';
import { generateReport } from '../api';
import { ReportData, WeeklyStats, MonthlyStats } from '../types';

const COLORS = ['#0088FE', '#FF8042'];

const Report: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const data = await generateReport();
        console.log('Raw API Response:', data);
        setReportData(data);

        // Set default selected month from MonthlyStats
        if (data.MonthlyStats && data.MonthlyStats.length > 0) {
          setSelectedMonth(data.MonthlyStats[0].persian_date);
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
      }
    };

    fetchReportData();
  }, []);

  if (!reportData) {
    return <div>در حال بارگذاری...</div>;
  }

  // Calculate totals from WeeklyStats
  const totalMale = reportData.WeeklyStats.reduce((sum, stat) => sum + (stat.male_count || 0), 0);
  const totalFemale = reportData.WeeklyStats.reduce((sum, stat) => sum + (stat.female_count || 0), 0);

  const genderPieData = [
    { name: 'مرد', value: totalMale },
    { name: 'زن', value: totalFemale }
  ];

  // Prepare weekly data - ensure we have exactly 4 weeks
  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    const weekNumber = i + 1;
    const weekStat = reportData.WeeklyStats.find(stat => stat.week === weekNumber) || {
      week: weekNumber,
      male_count: 0,
      female_count: 0
    };
    return weekStat;
  });

  // Filter monthly data based on selected month
  const monthlyData = reportData.MonthlyStats;

  return (
    <div className="report-container" style={{ padding: '20px' }}>
      <h1>گزارش آماری کاربران</h1>

      {/* Month Selection */}
      <div className="month-selector" style={{ marginBottom: '20px' }}>
        <label style={{ marginLeft: '10px' }}>انتخاب ماه: </label>
        <select 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{ 
            padding: '5px 10px',
            fontSize: '16px',
            direction: 'rtl'
          }}
        >
          {reportData.MonthlyStats.map(stat => (
            <option key={stat.persian_date} value={stat.persian_date}>
              {stat.persian_date}
            </option>
          ))}
        </select>
      </div>

      {/* Gender Distribution Pie Chart */}
      <div className="chart-section">
        <h2>توزیع جنسیتی کل کاربران</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={genderPieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({name, value, percent}) => 
                `${name}: ${(percent * 100).toFixed(0)}% (${value} نفر)`
              }
            >
              {genderPieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} نفر`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Gender Distribution Chart */}
      <div className="chart-section">
        <h2>توزیع جنسیتی هفتگی</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={weeklyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="week" 
              tickFormatter={(week) => `هفته ${week}`}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'male_count') return [`${value} نفر`, 'مرد'];
                if (name === 'female_count') return [`${value} نفر`, 'زن'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="male_count" name="مرد" fill={COLORS[0]} />
            <Bar dataKey="female_count" name="زن" fill={COLORS[1]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Users Chart */}
      <div className="chart-section">
        <h2>تعداد کاربران ماهانه</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="persian_date"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'male_count') return [`${value} نفر`, 'مرد'];
                if (name === 'female_count') return [`${value} نفر`, 'زن'];
                return [value, name];
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="male_count"
              name="مرد"
              stroke={COLORS[0]}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="female_count"
              name="زن"
              stroke={COLORS[1]}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Total Numbers Display */}
      <div className="totals-section" style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h2>آمار کلی</h2>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
          <div>
            <strong>تعداد کل مردان:</strong> {totalMale} نفر
          </div>
          <div>
            <strong>تعداد کل زنان:</strong> {totalFemale} نفر
          </div>
          <div>
            <strong>مجموع کل:</strong> {totalMale + totalFemale} نفر
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
