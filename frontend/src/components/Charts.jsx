import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

export const MacroPieChart = ({ macros }) => {
    const data = {
        labels: ['Protein (g)', 'Carbs (g)', 'Fat (g)'],
        datasets: [
            {
                data: [macros.protein, macros.carbs, macros.fat],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)', // Primary
                    'rgba(236, 72, 153, 0.8)', // Secondary
                    'rgba(16, 185, 129, 0.8)', // Green
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(16, 185, 129, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        color: '#f8fafc',
        plugins: {
            legend: {
                labels: {
                    color: '#f8fafc',
                }
            }
        }
    };

    return <Pie data={data} options={options} />;
};

export const CaloriesBarChart = ({ targetCalories }) => {
    const data = {
        labels: ['Daily Goal'],
        datasets: [
            {
                label: 'Calories',
                data: [targetCalories],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                borderRadius: 4
            },
        ],
    };

    const options = {
        indexAxis: 'y',
        color: '#f8fafc',
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.1)' },
                ticks: { color: '#94a3b8' },
                max: Math.max(targetCalories + 1000, 4000)
            },
            y: {
                grid: { display: false },
                ticks: { color: '#94a3b8' }
            }
        },
        plugins: {
            legend: { display: false }
        }
    };

    return <Bar data={data} options={options} />;
};
