import React, { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line,
  ResponsiveContainer 
} from 'recharts';
import { generateReport } from '../api';
import styles from '../styles/Report.module.css';

const COLORS = ['#0088FE', '#FF8042'];

const Report: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    generateReport().then(response => {
      console.log('API Response:', response);
      setData(response);
    });
  }, []);

  if (!data) return <div>Loading...</div>;

  const pieData = [
    { name: 'مرد', value: data.total.male_count || 0},
    { name: 'زن', value: data.total.female_count || 0}
  ];

  const allWeeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(weekName => ({
    name: weekName,
    male: 0,
    female: 0
  }))

  const barData = allWeeks.map(week => {
    const weekData = (data.weekly || []).find((w: any) => w.date === week.name);
    return {
      name: week.name,
      male: weekData ? weekData.male_count : 0,
      female: weekData ? weekData.female_count: 0
    }
  })

  const trendData = data.daily
    .filter(day => day.date) // Remove empty date entries
    .map(day => ({
        name: day.date.substring(6, 8), // Get just the day part
        male: day.male_count,
        female: day.female_count
    }));

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>گزارش آماری کاربران</h2>

      <div className={styles.chartSection}>
        <h3>توزیع جنسیتی کل کاربران</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({name, value}) => `${name}: ${value}`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartSection}>
        <h3>توزیع جنسیتی هفتگی</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="male" fill={COLORS[0]} name="مرد" />
            <Bar dataKey="female" fill={COLORS[1]} name="زن" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartSection}>
        <h3>روند ثبت نام روزانه</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              label={{ value: 'روز', position: 'bottom' }}
            />
            <YAxis 
              label={{ value: 'تعداد کاربران', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="male" stroke={COLORS[0]} name="مرد" />
            <Line type="monotone" dataKey="female" stroke={COLORS[1]} name="زن" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.statsCard}>
        <h3>آمار کلی</h3>
        <p>مردان: {data.total.male_count}</p>
        <p>زنان: {data.total.female_count}</p>
        <p>مجموع: {data.total.male_count + data.total.female_count}</p>
      </div>
    </div>
  );
};

export default Report;

