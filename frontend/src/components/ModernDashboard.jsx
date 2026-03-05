import React, { useEffect, useState } from 'react';
import AIAssistant from './AIAssistant';
import { Activity, Search, Info, MessageSquare } from 'lucide-react';

// Import meal images from assets to ensure Vite hashes and links them correctly for production
import breakfastImg from '../assets/breakfast.png';
import lunchImg from '../assets/lunch.png';
import dinnerImg from '../assets/dinner.png';
import snackImg from '../assets/snack.png';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler
);

// Reusable SVG Arc Component for Macros
const GlowingRing = ({ value, max, color, title, label, size = 70, stroke = 4 }) => {
    const radius = (size / 2) - stroke;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(value / (max || 1), 1);
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <div className="macro-ring-container" style={{ width: size + 20 }}>
            <div className="ring-title">{title}</div>
            <div className="ring-wrapper" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle className="ring-bg" cx={size / 2} cy={size / 2} r={radius} />
                    <defs>
                        <filter id={`glow-${title}`} x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    <circle
                        className="ring-progress"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        filter={`url(#glow-${title})`}
                    />
                </svg>
                <div className="ring-content" style={{ position: 'absolute' }}>
                    <div className="ring-value">{Math.round(value)}<span>{label}</span></div>
                </div>
            </div>
            <div className="ring-target">{Math.round(value)} / {max} {label}</div>
        </div>
    );
};

// --- Creative Vital Cluster Component ---
const VitalCluster = ({ data, targetCalories = 2000 }) => {
    if (!data) return null;

    const { activities = {}, burnedCalories = 0, totals = {}, meals = {} } = data;
    const steps = activities.steps || 0;
    const sleep = activities.sleep || 0;
    const workout = activities.workout || 0;
    const caloriesConsumed = totals.calories || 0;

    // Goals (Mock for activities)
    const stepGoal = 10000;
    const sleepGoal = 8;
    const workoutGoal = 45;
    const burnGoal = 500;

    // Calculate score components (0-1)
    const sScore = Math.min(steps / stepGoal, 1);
    const lScore = Math.min(sleep / sleepGoal, 1);
    const wScore = Math.min(workout / workoutGoal, 1);
    const bScore = Math.min(burnedCalories / burnGoal, 1);

    // Nutrition Score: How close are we to the calorie target?
    // We want to be within ±10% for 100%. If 0, it's 0. If double, it's 0.
    let nScore = 0;
    if (caloriesConsumed > 0) {
        const diff = Math.abs(caloriesConsumed - targetCalories);
        const margin = targetCalories * 0.1;
        if (diff <= margin) {
            nScore = 1;
        } else {
            // Scale linearly downwards from 100% at (target + margin) to 0% at (target * 2)
            // or from 100% at (target - margin) to 0% at 0
            if (caloriesConsumed > targetCalories) {
                nScore = Math.max(0, 1 - (diff - margin) / targetCalories);
            } else {
                nScore = Math.max(0, 1 - (diff - margin) / (targetCalories - margin));
            }
        }
    }

    // Overall Score (Weighted: 40% Activities, 60% Nutrition)
    const activitiesScore = (sScore + lScore + wScore + bScore) / 4;
    const overallScore = Math.round(((activitiesScore * 0.4) + (nScore * 0.6)) * 100);

    const mealTypes = [
        { id: 'breakfast', label: 'Breakfast', icon: '🥄' },
        { id: 'snack1', label: 'Snack 1', icon: '🥛' },
        { id: 'lunch', label: 'Lunch', icon: '🍴' },
        { id: 'snack2', label: 'Snack 2', icon: '🥜' },
        { id: 'dinner', label: 'Dinner', icon: '🍴' }
    ];

    return (
        <div className="vital-insights-content">
            <div className="vital-cluster-container" style={{ position: 'relative', height: '350px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* Central Score Node */}
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <div className="macro-ring-container" style={{ width: 150 }}>
                        <div className="ring-title" style={{ fontSize: '0.6rem' }}>VITAL SCORE</div>
                        <div className="ring-wrapper" style={{ width: 130, height: 130 }}>
                            <svg width="130" height="130" viewBox="0 0 130 130">
                                <circle cx="65" cy="65" r="58" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                                <circle
                                    cx="65"
                                    cy="65"
                                    r="58"
                                    stroke="var(--neon-purple)"
                                    strokeWidth="8"
                                    strokeDasharray={2 * Math.PI * 58}
                                    strokeDashoffset={(1 - (overallScore / 100)) * 2 * Math.PI * 58}
                                    strokeLinecap="round"
                                    fill="transparent"
                                    filter="drop-shadow(0 0 8px var(--neon-purple))"
                                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                                />
                            </svg>
                            <div className="ring-content" style={{ position: 'absolute' }}>
                                <div className="ring-value" style={{ fontSize: '2rem' }}>{overallScore}<span>%</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Satellite metrics with SVG connections */}
                <svg style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none', opacity: 0.3 }}>
                    <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="white" strokeWidth="1" strokeDasharray="4 2" />
                    <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="white" strokeWidth="1" strokeDasharray="4 2" />
                    <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="white" strokeWidth="1" strokeDasharray="4 2" />
                    <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="white" strokeWidth="1" strokeDasharray="4 2" />
                </svg>

                {/* Satellites */}
                <div style={{ position: 'absolute', top: '10%', left: '15%' }}>
                    <div className="glass-panel" style={{ padding: '0.75rem', borderRadius: '15px', background: 'rgba(255,107,0,0.05)', border: '1px solid var(--neon-orange)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Footprints size={16} color="var(--neon-orange)" />
                            <div>
                                <div style={{ color: 'var(--neon-orange)', fontWeight: 'bold', fontSize: '1rem' }}>{steps}</div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>STEPS</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ position: 'absolute', top: '10%', right: '15%' }}>
                    <div className="glass-panel" style={{ padding: '0.75rem', borderRadius: '15px', background: 'rgba(56,189,248,0.05)', border: '1px solid var(--neon-blue)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Moon size={16} color="var(--neon-blue)" />
                            <div>
                                <div style={{ color: 'var(--neon-blue)', fontWeight: 'bold', fontSize: '1rem' }}>{sleep}h</div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>SLEEP</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ position: 'absolute', bottom: '15%', left: '15%' }}>
                    <div className="glass-panel" style={{ padding: '0.75rem', borderRadius: '15px', background: 'rgba(34,197,94,0.05)', border: '1px solid var(--neon-green)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={16} color="var(--neon-green)" />
                            <div>
                                <div style={{ color: 'var(--neon-green)', fontWeight: 'bold', fontSize: '1rem' }}>{workout}m</div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>ACTIVE</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ position: 'absolute', bottom: '15%', right: '15%' }}>
                    <div className="glass-panel" style={{ padding: '0.75rem', borderRadius: '15px', background: 'rgba(239,68,68,0.05)', border: '1px solid #ef4444' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Flame size={16} color="#ef4444" />
                            <div>
                                <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1rem' }}>{burnedCalories}</div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>BURNED</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Macro floating notes */}
                <div style={{ position: 'absolute', top: '50%', right: '5%', transform: 'translateY(-50%)', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>{Math.floor(totals.protein || 0)}g</div> Protein
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>{Math.floor(totals.carbs || 0)}g</div> Carbs
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>{Math.floor(totals.fat || 0)}g</div> Fats
                    </div>
                </div>
            </div>

            {/* Linked Food Data Section */}
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '0.9rem', color: 'white', marginBottom: '1rem', letterSpacing: '1px', opacity: 0.8 }}>DAILY MEAL LOG</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {mealTypes.map(mType => (
                        <div key={mType.id} className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span>{mType.icon}</span> {mType.label}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--neon-blue)' }}>
                                    {meals[mType.id]?.reduce((sum, item) => sum + (item.food?.calories || 0), 0) || 0} kcal
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {meals[mType.id] && meals[mType.id].length > 0 ? (
                                    meals[mType.id].map((item, idx) => (
                                        <div key={idx} style={{ fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                            <span>{item.food?.name}</span>
                                            <span>{item.food?.calories} kcal</span>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>No logs</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


const ModernDashboard = ({ macrosData, mealPlan, user }) => {
    if (!macrosData) return null;

    const { targetCalories = 2000, macros = { protein: 0, carbs: 0, fat: 0 } } = macrosData || {};
    const { breakfast = {}, lunch = {}, dinner = {} } = mealPlan || {};

    const [dateStr, setDateStr] = useState('');
    const [apiDate, setApiDate] = useState('');
    const [dailySummary, setDailySummary] = useState({
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        meals: { breakfast: [], snack1: [], lunch: [], snack2: [], dinner: [] }
    });
    const [roadmapProgress, setRoadmapProgress] = useState(0);
    const [waterIntake, setWaterIntake] = useState(0);
    const [waterTarget, setWaterTarget] = useState(2.0);

    useEffect(() => {
        const weight = user?.weight || macrosData?.weight || 70;
        setWaterTarget((weight * 50) / 1000);
    }, [user, macrosData]);
    const [weeklyChartData, setWeeklyChartData] = useState([]);
    const [fridgeIngredients, setFridgeIngredients] = useState('');
    const [suggestedMeals, setSuggestedMeals] = useState([]);
    const [searchingFridge, setSearchingFridge] = useState(false);
    const [groceryList, setGroceryList] = useState([]);
    const [loadingGrocery, setLoadingGrocery] = useState(false);
    const [mealHistory, setMealHistory] = useState([]);
    const [historyDays, setHistoryDays] = useState(7);
    const [insightDate, setInsightDate] = useState(new Date().toISOString().split('T')[0]);
    const [insightData, setInsightData] = useState(null);
    const [loadingInsights, setLoadingInsights] = useState(false);


    const eaten = dailySummary?.totals?.calories || 0;
    const burned = dailySummary?.burnedCalories || 0;
    const netCalories = Math.max(0, eaten);

    const calProgress = targetCalories > 0 ? Math.min((netCalories / targetCalories) * 100, 100) : 0;
    const waterGoal = parseFloat(waterTarget) || 2.0;
    const waterProgress = Math.min(((waterIntake * 0.25) / waterGoal) * 100, 100);
    const progressPercent = Math.round((calProgress + waterProgress) / 2) || 0;

    const fetchAllData = (fDate) => {
        const d = fDate || apiDate;
        if (!d) return;

        fetch(`http://localhost:5000/daily-summary?date=${d}&userId=${user?.emailid}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.totals) {
                    setDailySummary(data);
                    // 5-meal sequence: Breakfast, Snack 1, Lunch, Snack 2, Dinner.
                    let loggedCount = 0;
                    if (data.meals.breakfast && data.meals.breakfast.length > 0) loggedCount++;
                    if (data.meals.snack1 && data.meals.snack1.length > 0) loggedCount++;
                    if (data.meals.lunch && data.meals.lunch.length > 0) loggedCount++;
                    if (data.meals.snack2 && data.meals.snack2.length > 0) loggedCount++;
                    if (data.meals.dinner && data.meals.dinner.length > 0) loggedCount++;
                    // Each gap is 20% (10% to 30% to 50% to 70% to 90%)
                    setRoadmapProgress((Math.max(0, loggedCount - 1)) * 20);
                }
            })
            .catch(err => console.error("Could not fetch daily summary", err));

        fetch(`http://localhost:5000/weekly-summary?userId=${user?.emailid}`)
            .then(res => res.json())
            .then(data => setWeeklyChartData(data))
            .catch(err => console.error("Could not fetch weekly summary", err));

        fetch(`http://localhost:5000/grocery-list?userId=${user?.emailid}`)
            .then(res => res.json())
            .then(data => setGroceryList(data))
            .catch(err => console.error("Could not fetch grocery list", err));

        fetch(`http://localhost:5000/api/fridge?userId=${user?.emailid}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.ingredients) setFridgeIngredients(data.ingredients);
            })
            .catch(err => console.error("Could not fetch fridge list", err));

        fetch(`http://localhost:5000/history?days=${historyDays}&userId=${user?.emailid}`)
            .then(res => res.json())
            .then(data => setMealHistory(data))
            .catch(err => console.error("Could not fetch history", err));
    };

    const fetchInsightData = async (date) => {
        setLoadingInsights(true);
        try {
            const res = await fetch(`http://localhost:5000/daily-summary?date=${date}&userId=${user?.emailid}`);
            const data = await res.json();
            setInsightData(data);
        } catch (err) {
            console.error("Could not fetch insight data", err);
            setInsightData(null);
        } finally {
            setLoadingInsights(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [historyDays]);

    useEffect(() => {
        if (insightDate) fetchInsightData(insightDate);
    }, [insightDate]);

    const handlePrevDay = () => {
        const d = new Date(insightDate);
        d.setDate(d.getDate() - 1);
        setInsightDate(d.toISOString().split('T')[0]);
    };

    const handleNextDay = () => {
        const d = new Date(insightDate);
        d.setDate(d.getDate() + 1);
        setInsightDate(d.toISOString().split('T')[0]);
    };

    useEffect(() => {
        const today = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        setDateStr(today.toLocaleDateString('en-US', options));

        // Format for API
        const month = '' + (today.getMonth() + 1);
        const day = '' + today.getDate();
        const year = today.getFullYear();
        const formattedApiDate = [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
        setApiDate(formattedApiDate);

        // Update water target if weight changed
        if (macrosData?.weight) {
            const calculatedTarget = (macrosData.weight * 50) / 1000;
            if (!localStorage.getItem('waterTarget')) {
                setWaterTarget(calculatedTarget);
            }
        }

        // Load Water for active user
        const savedWater = localStorage.getItem(`water_${user?.emailid}_${formattedApiDate}`);
        if (savedWater) setWaterIntake(parseInt(savedWater));

        fetchAllData(formattedApiDate);
    }, [user]);

    const saveFridgeToSupabase = async (ingredientsVal) => {
        try {
            await fetch('http://localhost:5000/api/fridge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredients: ingredientsVal, userId: user?.emailid })
            });
        } catch (err) {
            console.error("Failed to save fridge", err);
        }
    };

    const findMealsFromFridge = async () => {
        if (!fridgeIngredients.trim()) return;
        setSearchingFridge(true);
        try {
            // Support both "egg" and "egg: 2"
            const ings = fridgeIngredients.split(',').map(i => {
                const parts = i.split(':');
                return parts[0].trim();
            });
            const res = await fetch('http://localhost:5000/fridge-meals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredients: ings })
            });
            const data = await res.json();
            setSuggestedMeals(data);
        } catch (err) {
            console.error(err);
        } finally {
            setSearchingFridge(false);
        }
    };

    // Chart data for weekly progress
    const weeklyData = {
        labels: Array.isArray(weeklyChartData) ? weeklyChartData.map(d => d.label) : ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        datasets: [
            {
                data: (weeklyChartData && Array.isArray(weeklyChartData)) ? weeklyChartData.map(d => d.calories) : [0, 0, 0, 0, 0, 0, 0],
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#8b5cf6',
                pointBorderColor: 'white',
                fill: true
            }
        ]
    };

    const [fastingStart, setFastingStart] = useState(() => localStorage.getItem('fastingStart') || '20:00');
    const [fastingEnd, setFastingEnd] = useState(() => localStorage.getItem('fastingEnd') || '12:00');

    const [logStatus, setLogStatus] = useState('');
    const [isEditingFast, setIsEditingFast] = useState(false);

    const logFasting = async () => {
        try {
            const today = new Date();
            const month = '' + (today.getMonth() + 1);
            const day = '' + today.getDate();
            const year = today.getFullYear();
            const formattedApiDate = [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');

            const response = await fetch('http://localhost:5000/log-fasting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: formattedApiDate,
                    startTime: fastingStart,
                    endTime: fastingEnd,
                    userId: user?.emailid
                })
            });
            const data = await response.json();
            if (data.success) {
                setLogStatus('Fast Logged!');
                fetchAllData(formattedApiDate);
                setTimeout(() => setLogStatus(''), 3000);
            }
        } catch (err) {
            console.error("Failed to log fast", err);
            setLogStatus('Error logging fast');
            setTimeout(() => setLogStatus(''), 3000);
        }
    };

    const handleFastingChange = (type, val) => {
        if (type === 'start') {
            setFastingStart(val);
            localStorage.setItem('fastingStart', val);
        } else {
            setFastingEnd(val);
            localStorage.setItem('fastingEnd', val);
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.05)', display: true, drawBorder: false },
                ticks: { color: '#94a3b8', font: { size: 10 } }
            },
            y: {
                display: false,
                beginAtZero: true
            }
        }
    };


    return (
        <div className="dashboard-container">

            {/* Top Navigation */}
            <div className="top-nav">
                <button className="nav-icon-btn"><Menu size={24} /></button>
                <span className="nav-title">Nutritional Planner</span>
                <div className="nav-icons">
                    <button
                        onClick={() => {
                            localStorage.removeItem('supabaseUser');
                            localStorage.removeItem('userProfileForm');
                            window.location.reload();
                        }}
                        className="btn-primary"
                        style={{ width: 'auto', marginTop: 0, background: 'var(--neon-red)', padding: '0.4rem 1rem', fontSize: '0.75rem' }}
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {/* Progress & Date Section */}
            <div>
                <div className="date-text">{dateStr}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <h1 style={{ color: 'white', margin: '0.5rem 0', fontSize: '2.5rem' }}>Welcome, {user?.username || 'User'}!</h1>
                    {macrosData?.bmi && (
                        <div style={{
                            background: 'rgba(6, 182, 212, 0.15)',
                            border: '1px solid var(--neon-cyan)',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            color: 'var(--neon-cyan)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                        }}>
                            <span>BMI: {macrosData.bmi}</span>
                            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                                ({macrosData.bmi < 18.5 ? 'Underweight' : macrosData.bmi < 25 ? 'Normal' : macrosData.bmi < 30 ? 'Overweight' : 'Obese'})
                            </span>
                        </div>
                    )}
                </div>
                <div className="progress-headline">You're {progressPercent}% on track today!</div>
                <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
            </div>

            {/* Macro Rings & Water */}
            <div className="glass-panel">
                <div className="macro-rings-grid">
                    <GlowingRing value={netCalories} max={targetCalories} color="var(--neon-orange)" title="NET KCAL" label="kcal" />
                    <GlowingRing value={dailySummary.totals.protein} max={macros.protein} color="var(--neon-blue)" title="PROTEIN" label="g" />
                    <GlowingRing value={dailySummary.totals.carbs} max={macros.carbs} color="var(--neon-cyan)" title="CARBS" label="g" />
                    <GlowingRing value={dailySummary.totals.fat} max={macros.fat} color="var(--neon-green)" title="FATS" label="g" />

                    <div className="water-widget">
                        <div className="water-title">
                            Water Intake
                        </div>
                        <div className="drops-row">
                            {Array.from({ length: Math.ceil(waterTarget / 0.25) }, (_, i) => i + 1).map(cup => (
                                <div
                                    key={cup}
                                    onClick={() => {
                                        const newWater = cup === waterIntake ? cup - 1 : cup;
                                        setWaterIntake(newWater);
                                        localStorage.setItem(`water_${user?.emailid}_${apiDate}`, newWater);
                                    }}
                                    className={`drop ${cup > waterIntake ? 'empty' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                ></div>
                            ))}
                        </div>
                        <div className="water-text"><strong>{(waterIntake * 0.25).toFixed(2)}</strong> / {waterTarget} L</div>
                    </div>
                </div>
            </div>

            {/* Meals Roadmap */}
            <div className="glass-panel" style={{ padding: '2rem 1.25rem' }}>
                <div className="meals-roadmap">
                    {/* Dynamic Connecting line */}
                    <div className="roadmap-line-bg" style={{ left: '10%', right: '10%' }}></div>
                    <div className="roadmap-line-fill" style={{
                        left: '10%',
                        width: `${roadmapProgress}%`
                    }}></div>

                    <div className={`meal-col ${dailySummary.meals.breakfast.length > 0 ? 'completed' : ''}`}>
                        <div className="meal-icon-wrapper"><span style={{ fontSize: '12px' }}>🥄</span></div>
                        <div className="meal-name">Breakfast</div>
                        <div className="meal-image-container"><img src={breakfastImg} alt="Breakfast" /></div>
                    </div>

                    <div className={`meal-col ${dailySummary.meals.snack1?.length > 0 ? 'completed' : ''}`}>
                        <div className="meal-icon-wrapper"><span style={{ fontSize: '12px' }}>🥛</span></div>
                        <div className="meal-name">Snack 1</div>
                        <div className="meal-image-container"><img src={snackImg} alt="Snack 1" /></div>
                    </div>

                    <div className={`meal-col ${dailySummary.meals.lunch.length > 0 ? 'completed' : ''}`}>
                        <div className="meal-icon-wrapper"><span style={{ fontSize: '12px' }}>🍴</span></div>
                        <div className="meal-name">Lunch</div>
                        <div className="meal-image-container"><img src={lunchImg} alt="Lunch" /></div>
                    </div>

                    <div className={`meal-col ${dailySummary.meals.snack2?.length > 0 ? 'completed' : ''}`}>
                        <div className="meal-icon-wrapper"><span style={{ fontSize: '12px' }}>🥜</span></div>
                        <div className="meal-name">Snack 2</div>
                        <div className="meal-image-container"><img src={snackImg} alt="Snack 2" /></div>
                    </div>

                    <div className={`meal-col ${dailySummary.meals.dinner.length > 0 ? 'completed' : ''}`}>
                        <div className="meal-icon-wrapper"><span style={{ fontSize: '12px' }}>🍴</span></div>
                        <div className="meal-name">Dinner</div>
                        <div className="meal-image-container"><img src={dinnerImg} alt="Dinner" /></div>
                    </div>

                </div>
            </div>

            {/* Bottom Row */}
            <div className="widgets-row">

                {/* Fasting Tracker */}
                <div className="glass-panel tip-widget" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative' }}>
                    <div className="score-title" style={{ marginBottom: '1rem' }}>TODAYS FAST</div>

                    <div style={{ margin: '0.5rem 0' }}>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            color: 'var(--neon-purple)',
                            display: 'flex',
                            gap: '0.5rem',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: '1rem'
                        }}>
                            <span style={{ fontSize: '1.25rem', opacity: 0.6 }}>{fastingStart}</span>
                            <span style={{ fontSize: '1rem', opacity: 0.4 }}>→</span>
                            <span style={{ fontSize: '1.25rem', opacity: 0.6 }}>{fastingEnd}</span>
                        </div>

                        {(isEditingFast || !dailySummary.fasting) && (
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem', opacity: 0.7 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>START</label>
                                    <input
                                        type="time"
                                        value={fastingStart}
                                        onChange={(e) => handleFastingChange('start', e.target.value)}
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white',
                                            padding: '2px 4px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>END</label>
                                    <input
                                        type="time"
                                        value={fastingEnd}
                                        onChange={(e) => handleFastingChange('end', e.target.value)}
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white',
                                            padding: '2px 4px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                if (dailySummary.fasting && !isEditingFast) {
                                    setIsEditingFast(true);
                                } else {
                                    logFasting();
                                    setIsEditingFast(false);
                                }
                            }}
                            className="btn-primary"
                            style={{
                                marginTop: '0',
                                padding: '6px 16px',
                                fontSize: '0.75rem',
                                width: 'auto',
                                background: dailySummary.fasting ? 'rgba(139, 92, 246, 0.2)' : 'var(--neon-purple)',
                                border: dailySummary.fasting ? '1px solid var(--neon-purple)' : 'none'
                            }}
                        >
                            {dailySummary.fasting ? (isEditingFast ? 'Save Fast' : 'Update Fast') : 'Log fasting'}
                        </button>

                        {logStatus && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--neon-green)', marginTop: '0.5rem' }}>{logStatus}</div>
                        )}
                    </div>
                </div>

                {/* Fridge Widget */}
                <div className="glass-panel fridge-widget" style={{ padding: '1.5rem' }}>
                    <div className="score-title" style={{ marginBottom: '0.5rem' }}>MY FRIDGE</div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Enter items (e.g. egg: 2, chicken: 500g)</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="item: portion, ..."
                            value={fridgeIngredients}
                            onChange={(e) => setFridgeIngredients(e.target.value)}
                            onBlur={(e) => saveFridgeToSupabase(e.target.value)}
                            style={{ height: '36px', fontSize: '0.8rem', flex: 1 }}
                        />
                        <button className="btn-primary" onClick={findMealsFromFridge} style={{ padding: '0 1rem', fontSize: '0.8rem', width: 'auto' }}>AI Plan</button>
                    </div>

                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {suggestedMeals.length > 0 ? (
                            suggestedMeals.map((meal, idx) => (
                                <div key={idx} style={{
                                    padding: '0.5rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    marginBottom: '0.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '0.8rem' }}>{meal.name}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--neon-blue)' }}>{meal.calories} kcal</span>
                                </div>
                            ))
                        ) : fridgeIngredients && !searchingFridge ? (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No exact matches. Type common items!</div>
                        ) : null}
                    </div>
                </div>

                {/* Grocery List Widget */}
                <div className="glass-panel grocery-widget" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div className="score-title" style={{ margin: 0 }}>SMART GROCERY LIST</div>
                        <button
                            onClick={async () => {
                                setLoadingGrocery(true);
                                try {
                                    const res = await fetch(`http://localhost:5000/predict-grocery?userId=${user?.emailid}`);
                                    const data = await res.json();
                                    setGroceryList(data);
                                } catch (err) {
                                    console.error(err);
                                } finally {
                                    setLoadingGrocery(false);
                                }
                            }}
                            style={{
                                background: 'rgba(59, 130, 246, 0.2)',
                                border: '1px solid var(--neon-blue)',
                                color: 'var(--neon-blue)',
                                fontSize: '0.6rem',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            {loadingGrocery ? 'Analyzing...' : 'PREDICT NEXT WEEK'}
                        </button>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Based on your consumption patterns</p>

                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {groceryList && groceryList.length > 0 ? (
                            groceryList.map((item, idx) => (
                                <div key={idx} style={{
                                    padding: '0.6rem',
                                    background: 'rgba(16, 185, 129, 0.05)',
                                    borderRadius: '8px',
                                    marginBottom: '0.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderLeft: '3px solid var(--neon-green)'
                                }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{item.name}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.estimation}</span>
                                </div>
                            ))
                        ) : (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                                Log some Indian meals to generate your list!
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Health Insights Summary */}
            <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'var(--neon-purple)', padding: '8px', borderRadius: '10px' }}><Activity color="white" size={20} /></div>
                        <div className="score-title" style={{ margin: 0, letterSpacing: '2px' }}>VITAL INSIGHTS</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button onClick={handlePrevDay} className="btn-icon" style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}>
                            <ChevronLeft size={16} />
                        </button>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0 10px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            height: '36px'
                        }}>
                            <Calendar size={14} style={{ opacity: 0.6 }} />
                            <input
                                type="date"
                                value={insightDate}
                                onChange={(e) => setInsightDate(e.target.value)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <button onClick={handleNextDay} className="btn-icon" style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {insightData ? (
                    <div className="insight-creative-display">
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>{new Date(insightDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Analyzed Bio-Summary</div>
                        </div>

                        <VitalCluster data={insightData} />
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                        <Bot size={40} className="spinning" style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <div>Synchronizing daily telemetry...</div>
                    </div>
                )}
            </div>

            <style>{`
                .spinning { animation: spin 2s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ModernDashboard;
