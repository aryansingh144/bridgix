'use client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

const data = {
  labels: months,
  datasets: [
    {
      label: 'Alumni Activity',
      data: [42, 58, 67, 73, 65, 89, 95, 102, 88, 115, 128, 134],
      borderColor: '#FF8C42',
      backgroundColor: 'rgba(255, 140, 66, 0.1)',
      tension: 0.4,
      fill: false,
      pointBackgroundColor: '#FF8C42',
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2.5,
    },
    {
      label: 'Student Activity',
      data: [125, 138, 142, 156, 134, 178, 189, 201, 167, 234, 256, 278],
      borderColor: '#2BC0B4',
      backgroundColor: 'rgba(43, 192, 180, 0.1)',
      tension: 0.4,
      fill: false,
      pointBackgroundColor: '#2BC0B4',
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2.5,
    },
    {
      label: 'Overall',
      data: [167, 196, 209, 229, 199, 267, 284, 303, 255, 349, 384, 412],
      borderColor: '#6C63FF',
      backgroundColor: 'rgba(108, 99, 255, 0.05)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#6C63FF',
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2.5,
      borderDash: [5, 3],
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        font: {
          size: 12,
          family: 'Inter, sans-serif',
        },
        color: '#6b7280',
      },
    },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: '#1a1a2e',
      bodyColor: '#6b7280',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (context) => ` ${context.dataset.label}: ${context.parsed.y} interactions`,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, sans-serif',
        },
        color: '#9ca3af',
      },
    },
    y: {
      grid: {
        color: '#f3f4f6',
        drawBorder: false,
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, sans-serif',
        },
        color: '#9ca3af',
        padding: 8,
      },
      border: {
        display: false,
      },
    },
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
};

export default function ActivityChart() {
  return (
    <div style={{ height: '280px' }}>
      <Line data={data} options={options} />
    </div>
  );
}
