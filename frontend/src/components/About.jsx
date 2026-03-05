import React from 'react';
import { Apple, Activity, Search, ShieldCheck, Zap, Heart } from 'lucide-react';

const About = () => {
    const features = [
        {
            title: "Intelligent Diet Tracking",
            icon: <Apple className="neon-blue-text" size={24} />,
            points: [
                "Extensive database of 500+ authentic Indian food items.",
                "Precise portion control with gram-based logging.",
                "Automated calorie and macronutrient (Protein, Carbs, Fat) breakdown."
            ]
        },
        {
            title: "Advanced Health Monitoring",
            icon: <Activity className="neon-green-text" size={24} />,
            points: [
                "Real-time step counter and activity streak tracking.",
                "Sleep analysis and workout duration monitoring.",
                "Dynamic progress rings for all health goals."
            ]
        },
        {
            title: "Smart Kitchen & Grocery",
            icon: <Search className="neon-orange-text" size={24} />,
            points: [
                "Fridge analysis: Suggests meals based on your available ingredients.",
                "Predictive Grocery List: AI-driven estimation of next week's needs.",
                "7-Day history for item-by-item consumption review."
            ]
        },
        {
            title: "Personalized AI Insights",
            icon: <Zap className="neon-purple-text" size={24} />,
            points: [
                "Automatic water target calculation based on body weight.",
                "Live BMI (Body Mass Index) assessment and tracking.",
                "Custom caloric targets based on age, gender, and activity level."
            ]
        }
    ];

    return (
        <div className="container" style={{ maxWidth: '1000px', padding: '2rem' }}>
            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '2rem' }}>
                <h1 className="title" style={{ fontSize: '2.5rem', textAlign: 'left', marginBottom: '1rem' }}>
                    Welcome to <span className="neon-purple-text">AI Nutrition Planner</span>
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                    Your all-in-one smart health companion designed to simplify nutrition, track activity, and empower your wellness journey with cutting-edge AI insights.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {features.map((feature, index) => (
                        <div key={index} className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                    {feature.icon}
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>{feature.title}</h3>
                            </div>
                            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                                {feature.points.map((point, pIndex) => (
                                    <li key={pIndex} style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                    <h2 style={{ color: 'var(--neon-purple)', marginBottom: '1rem' }}>Our Mission</h2>
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        "To leverage technology and data-driven insights to make healthy living intuitive, accessible, and sustainable for everyone."
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
