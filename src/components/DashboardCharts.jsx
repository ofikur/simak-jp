import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardCharts({ transactions }) {
  const processDataForChart = () => {
    const expenseData = {};
    transactions
      .filter(t => t.type === 'pengeluaran')
      .forEach(t => {
        if (expenseData[t.category]) {
          expenseData[t.category] += t.amount;
        } else {
          expenseData[t.category] = t.amount;
        }
      });
    return { labels: Object.keys(expenseData), data: Object.values(expenseData) };
  };

  const { labels, data } = processDataForChart();

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
      },
    ],
  };
  
  if (data.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md text-center">
        <h3 className="text-xl font-bold mb-4">Grafik Pengeluaran</h3>
        <p className="text-gray-500">Belum ada data pengeluaran.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Pengeluaran per Kategori</h3>
      <Pie data={chartData} />
    </div>
  );
}