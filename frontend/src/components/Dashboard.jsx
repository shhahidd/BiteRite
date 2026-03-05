import React from 'react';
import { MacroPieChart, CaloriesBarChart } from './Charts';

const Dashboard = ({ macrosData }) => {
    if (!macrosData) return null;

    const { targetCalories, macros, bmr, tdee } = macrosData;

    return (
        <div className="card">
            <h2>Nutrition Dashboard</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Your daily calculated targets.</p>

            <div className="grid">
                <div className="macro-box">
                    <div className="value">{targetCalories}</div>
                    <div className="label">Daily Calorie Target</div>
                </div>
                <div className="macro-box">
                    <div className="value" style={{ color: 'var(--primary-color)' }}>{macros.protein}g</div>
                    <div className="label">Protein</div>
                </div>
                <div className="macro-box">
                    <div className="value" style={{ color: 'var(--secondary-color)' }}>{macros.carbs}g</div>
                    <div className="label">Carbs</div>
                </div>
                <div className="macro-box">
                    <div className="value" style={{ color: 'var(--accent-green)' }}>{macros.fat}g</div>
                    <div className="label">Fat</div>
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', alignItems: 'center' }}>
                <div>
                    <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                        <MacroPieChart macros={macros} />
                    </div>
                </div>
                <div>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '1rem' }}>Calorie Overview</h3>
                    <CaloriesBarChart targetCalories={targetCalories} />
                    <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        <p><strong>BMR:</strong> {bmr} kcal</p>
                        <p><strong>TDEE:</strong> {tdee} kcal</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
