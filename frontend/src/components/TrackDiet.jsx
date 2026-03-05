import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus } from 'lucide-react';

const TrackDiet = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const [dailySummary, setDailySummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(true);

    // Helper to get today's date in YYYY-MM-DD
    const getToday = () => {
        const d = new Date();
        const month = '' + (d.getMonth() + 1);
        const day = '' + d.getDate();
        const year = d.getFullYear();
        return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    };

    const todayStr = getToday();

    const loadDailySummary = async () => {
        setLoadingSummary(true);
        try {
            const res = await axios.get(`http://localhost:5000/daily-summary?date=${todayStr}`);
            setDailySummary(res.data);
        } catch (err) {
            console.error("Failed to load daily summary", err);
        } finally {
            setLoadingSummary(false);
        }
    };

    useEffect(() => {
        loadDailySummary();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoadingSearch(true);
        try {
            const res = await axios.get(`http://localhost:5000/search-foods?query=${searchQuery}`);
            setSearchResults(res.data);
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setLoadingSearch(false);
        }
    };

    const [selectedWeights, setSelectedWeights] = useState({});

    const handleWeightChange = (foodId, val) => {
        setSelectedWeights(prev => ({ ...prev, [foodId]: val }));
    };

    const [selectedMealType, setSelectedMealType] = useState('breakfast');

    const logFood = async (foodId) => {
        const weight = parseFloat(selectedWeights[foodId]) || 100;
        try {
            await axios.post('http://localhost:5000/log-food', {
                foodId,
                mealType: selectedMealType,
                date: todayStr,
                weight
            });
            // Refresh summary
            loadDailySummary();
            // Clear search and weights
            setSearchQuery('');
            setSearchResults([]);
            setSelectedWeights({});
        } catch (err) {
            console.error("Failed to log food", err);
            alert("Failed to log food. Make sure the backend is running.");
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <h1 className="title" style={{ marginTop: '2rem', textAlign: 'left', fontSize: '2rem' }}>Track Diet</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Search your foods and add them to your daily log.</p>

            {/* Meal Selection - Dropdown for Search Results */}
            <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search for eg. 'Healthy Chicken', 'Sweet Milk'..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '40px', width: '100%' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: 'auto', marginTop: '0', padding: '0.75rem 1.5rem' }}>
                        {loadingSearch ? 'Searching...' : 'Search'}
                    </button>
                </form>

                {searchResults.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--brColor)', paddingBottom: '0.5rem' }}>Search Results</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {searchResults.map(food => (
                                <div key={food.id} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>
                                                {food.name}
                                                <span style={{ fontSize: '0.85rem', color: 'var(--neon-orange)', marginLeft: '8px' }}>
                                                    {Math.round((food.calories / (food.baseWeight || 100)) * (selectedWeights[food.id] || 100))} kcal
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {(food.baseWeight || 100)}g base •
                                                P: {parseFloat(((food.protein / (food.baseWeight || 100)) * (selectedWeights[food.id] || 100)).toFixed(1))}g •
                                                C: {parseFloat(((food.carbs / (food.baseWeight || 100)) * (selectedWeights[food.id] || 100)).toFixed(1))}g •
                                                F: {parseFloat(((food.fat / (food.baseWeight || 100)) * (selectedWeights[food.id] || 100)).toFixed(1))}g
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Grams:</label>
                                                <input
                                                    type="number"
                                                    step="10"
                                                    min="1"
                                                    className="form-control"
                                                    value={selectedWeights[food.id] || 100}
                                                    onChange={(e) => handleWeightChange(food.id, e.target.value)}
                                                    style={{ width: '70px', padding: '4px', textAlign: 'center', height: '35px' }}
                                                />
                                            </div>
                                            <select
                                                className="form-control"
                                                value={selectedMealType}
                                                onChange={(e) => setSelectedMealType(e.target.value)}
                                                style={{ width: '120px', height: '35px', padding: '0 8px', fontSize: '0.8rem' }}
                                            >
                                                <option value="breakfast">Breakfast</option>
                                                <option value="snack1">Snack 1</option>
                                                <option value="lunch">Lunch</option>
                                                <option value="snack2">Snack 2</option>
                                                <option value="dinner">Dinner</option>
                                            </select>
                                            <button
                                                onClick={() => logFood(food.id)}
                                                className="btn-primary"
                                                style={{ width: 'auto', marginTop: 0, padding: '0 1rem', fontSize: '0.75rem', height: '35px' }}
                                            >
                                                + Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Daily Summary */}
            <div className="glass-panel">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Today's Log ({todayStr})</h2>
                {loadingSummary ? (
                    <p>Loading...</p>
                ) : dailySummary && dailySummary?.totals?.calories > 0 ? (
                    <div>
                        <div className="macro-rings-grid" style={{ marginBottom: '2rem' }}>
                            <div className="macro-ring-container text-center">
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--neon-orange)' }}>{dailySummary.totals.calories}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>KCAL EATEN</div>
                            </div>
                            <div className="macro-ring-container text-center">
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--neon-blue)' }}>{dailySummary.totals.protein}g</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PROTEIN</div>
                            </div>
                            <div className="macro-ring-container text-center">
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--neon-cyan)' }}>{dailySummary.totals.carbs}g</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CARBS</div>
                            </div>
                            <div className="macro-ring-container text-center">
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--neon-green)' }}>{dailySummary.totals.fat}g</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FAT</div>
                            </div>
                        </div>

                        {['breakfast', 'lunch', 'snack', 'dinner'].map(meal => (
                            <div key={meal} style={{ marginBottom: '1rem' }}>
                                <h4 style={{ textTransform: 'capitalize', color: 'var(--text-main)', borderBottom: '1px solid var(--brColor)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>{meal}</h4>
                                {(!dailySummary?.meals?.[meal] || dailySummary.meals[meal].length === 0) ? (
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No foods logged yet.</p>
                                ) : (
                                    dailySummary.meals[meal].map((log, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.875rem' }}>
                                            <span>{log.food.name}</span>
                                            <span style={{ color: 'var(--neon-orange)' }}>{log.food.calories} kcal</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)' }}>You haven't logged any foods yet today. Search above to get started!</p>
                )}
            </div>

        </div>
    );
};

export default TrackDiet;
