import React, { useState, useEffect } from 'react';
import { Moon, Footprints, Dumbbell, CheckCircle, TrendingUp, Flame, MapPin, Zap, Info } from 'lucide-react';

const HealthTrackers = ({ user }) => {
    const [stats, setStats] = useState({ steps: 0, sleep: 0, workout: 0 });
    const [trendData, setTrendData] = useState([]);
    const [streak, setStreak] = useState(0);
    const [dailySummary, setDailySummary] = useState(null);
    const [tempValues, setTempValues] = useState({ steps: '', sleep: '', workout: '' });
    const [editMode, setEditMode] = useState({ steps: false, sleep: false, workout: false });
    const [logStatus, setLogStatus] = useState('');
    const [loading, setLoading] = useState(true);

    const GOALS = {
        steps: 10000,
        sleep: 8,
        workout: 60
    };

    const today = new Date().toISOString().split('T')[0];

    const fetchAllData = async () => {
        try {
            const [statsRes, trendsRes] = await Promise.all([
                fetch(`http://localhost:5000/daily-summary?date=${today}&userId=${user?.emailid}`),
                fetch(`http://localhost:5000/activity-trends?userId=${user?.emailid}`)
            ]);

            const statsData = await statsRes.json();
            const trendsData = await trendsRes.json();

            if (statsData.activities) {
                setStats({
                    steps: statsData.activities.steps || 0,
                    sleep: statsData.activities.sleep || 0,
                    workout: statsData.activities.workout || 0
                });
                setDailySummary(statsData);
            }

            if (trendsData) {
                setTrendData(trendsData.trends || []);
                setStreak(trendsData.streak || 0);
            }
        } catch (err) {
            console.error("Failed to fetch activity data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const logActivity = async (type, unit) => {
        const rawVal = tempValues[type];
        const val = parseFloat(rawVal);

        if (rawVal === '' || isNaN(val) || val < 0) {
            alert("Please enter a valid non-negative number.");
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/log-activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, value: val, unit, date: today, userId: user?.emailid })
            });
            const data = await res.json();
            if (data.success) {
                setLogStatus(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
                setEditMode(prev => ({ ...prev, [type]: false }));
                setTempValues(prev => ({ ...prev, [type]: '' }));
                await fetchAllData();
                setTimeout(() => setLogStatus(''), 3000);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to log activity. Check connection.");
        }
    };

    const ProgressRing = ({ value, goal, color }) => {
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const percent = Math.min((value / goal) * 100, 100);
        const offset = circumference - (percent / 100) * circumference;

        return (
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="60" cy="60" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle cx="60" cy="60" r={radius} fill="transparent" stroke={color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-in-out', filter: `drop-shadow(0 0 5px ${color})` }} />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>{Math.round(percent)}%</div>
                </div>
            </div>
        );
    };

    const DistanceCard = () => {
        const km = (stats.steps * 0.00075).toFixed(2);
        return (
            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', width: '100%' }}>
                <div className="meal-icon-wrapper" style={{ background: 'var(--neon-cyan)', color: 'white' }}>
                    <MapPin size={20} />
                </div>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DISTANCE COVERED</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>{km} KM</div>
                </div>
            </div>
        );
    };

    const StreakCard = () => (
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
            <div className="meal-icon-wrapper" style={{ background: 'var(--neon-red)', color: 'white' }}>
                <Flame size={20} />
            </div>
            <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ACTIVITY STREAK</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--neon-red)' }}>{streak} Days</div>
            </div>
        </div>
    );

    const DailySummarySection = () => {
        if (!dailySummary) return null;
        const totalBurned = dailySummary.burnedCalories || 0;
        const netKcal = (dailySummary.totals.calories || 0);

        return (
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--brColor)', paddingBottom: '0.5rem' }}>
                    <Info size={18} color="var(--neon-cyan)" />
                    <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Today's Insight Summary</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>ENERGY BALANCE</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{netKcal} <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>NET KCAL</span></div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--neon-green)', marginTop: '0.25rem' }}>Burned {totalBurned} kcal through activity</div>
                    </div>

                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>SLEEP QUALITY</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{stats.sleep} <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>HOURS</span></div>
                        <div style={{ fontSize: '0.7rem', color: stats.sleep >= 7 ? 'var(--neon-green)' : 'var(--neon-orange)', marginTop: '0.25rem' }}>
                            {stats.sleep >= 7 ? 'Optimal recovery detected.' : 'Aim for 7-8 hours for better focus.'}
                        </div>
                    </div>

                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>PACE & DISTANCE</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{(stats.steps * 0.00075).toFixed(2)} <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>KM</span></div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--neon-cyan)', marginTop: '0.25rem' }}>Equivalent to approx {Math.round(stats.steps / 120)} flights of stairs.</div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="dashboard-container"><h2 style={{ color: 'white' }}>Loading health insights...</h2></div>;

    return (
        <div className="dashboard-container" style={{ paddingBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ color: 'white', marginBottom: '0.25rem', fontSize: '2rem' }}>Health & Activity Insights</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track your consistency and reach your daily fitness goals.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <StreakCard />
                </div>
            </div>

            <DailySummarySection />

            <div className="widgets-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Steps Tracker */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
                        <div className="meal-icon-wrapper" style={{ background: 'var(--neon-green)', color: 'white', margin: 0 }}><Footprints size={20} /></div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>TARGET: 10,000</div>
                        </div>
                    </div>
                    <ProgressRing value={stats.steps} goal={GOALS.steps} color="var(--neon-green)" />
                    <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{stats.steps}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Steps Today</div>
                    </div>
                    <DistanceCard />
                    <button className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => setEditMode({ ...editMode, steps: true })}>Log Steps</button>
                </div>

                {/* Sleep Tracker */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
                        <div className="meal-icon-wrapper" style={{ background: 'var(--neon-purple)', color: 'white', margin: 0 }}><Moon size={20} /></div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>TARGET: 8 HOURS</div>
                        </div>
                    </div>

                    <ProgressRing value={stats.sleep} goal={GOALS.sleep} color="var(--neon-purple)" />

                    <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{stats.sleep}h</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sleep Last Night</div>
                    </div>

                    <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', width: '100%' }}>
                        <div className="meal-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--neon-purple)' }}><CheckCircle size={20} /></div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RECOVERY</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>{stats.sleep >= 7 ? 'Good' : 'Needs Rest'}</div>
                        </div>
                    </div>

                    <button className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => setEditMode({ ...editMode, sleep: true })}>Log Sleep</button>
                </div>

                {/* Workout Tracker */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
                        <div className="meal-icon-wrapper" style={{ background: 'var(--neon-orange)', color: 'white', margin: 0 }}><Dumbbell size={20} /></div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>GOAL: 60 MINS</div>
                        </div>
                    </div>
                    <ProgressRing value={stats.workout} goal={GOALS.workout} color="var(--neon-orange)" />
                    <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{stats.workout}m</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Minutes Active</div>
                    </div>
                    <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', width: '100%' }}>
                        <div className="meal-icon-wrapper" style={{ background: 'var(--neon-blue)', color: 'white' }}><Zap size={20} /></div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LEVEL</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>{stats.workout >= 30 ? 'High Intensity' : 'Light Activity'}</div>
                        </div>
                    </div>
                    <button className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => setEditMode({ ...editMode, workout: true })}>Log Workout</button>
                </div>
            </div>

            {/* Modals for Logging */}
            {Object.keys(editMode).some(k => editMode[k]) && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '400px', padding: '2rem', border: '1px solid var(--neon-cyan)' }}>
                        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Log {Object.keys(editMode).find(k => editMode[k])}</h2>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Enter amount..."
                            value={tempValues[Object.keys(editMode).find(k => editMode[k])]}
                            onChange={(e) => setTempValues({ ...tempValues, [Object.keys(editMode).find(k => editMode[k])]: e.target.value })}
                            style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '2rem' }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-primary" style={{ marginTop: 0 }} onClick={() => logActivity(Object.keys(editMode).find(k => editMode[k]), Object.keys(editMode).find(k => editMode[k]) === 'steps' ? 'steps' : (Object.keys(editMode).find(k => editMode[k]) === 'sleep' ? 'hours' : 'mins'))}>Confirm</button>
                            <button className="tip-btn" style={{ marginTop: 0 }} onClick={() => setEditMode({ steps: false, sleep: false, workout: false })}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {logStatus && (
                <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--neon-green)', color: 'white', padding: '1rem 2rem', borderRadius: '8px', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)', fontWeight: 'bold', zIndex: 1000 }}>
                    {logStatus}
                </div>
            )}
        </div>
    );
};

export default HealthTrackers;
