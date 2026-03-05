import React, { useState } from 'react';
import { Search, Loader2, Info } from 'lucide-react';

const JustCurious = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);
    const [portion, setPortion] = useState(1);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/search-foods?query=${query}`);
            const data = await res.json();
            setResults(data);
            setSelectedFood(null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <h1 style={{ color: 'white', marginBottom: '0.5rem' }}>Just Curious?</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Curious about how many calories are in your food? Instantly check the nutritional value of any dish in seconds.</p>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search Indian food (e.g. Dosa, Paneer...)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            style={{ paddingLeft: '3rem' }}
                        />
                    </div>
                    <button className="btn-primary" onClick={handleSearch} style={{ marginTop: '0', width: 'auto', padding: '0 2rem' }}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Analyze'}
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: selectedFood ? '1fr 1fr' : '1fr', gap: '2rem' }}>
                    {/* Search Results */}
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {results.length > 0 ? (
                            results.map((food) => (
                                <div
                                    key={food.id}
                                    onClick={() => setSelectedFood(food)}
                                    style={{
                                        padding: '1rem',
                                        background: selectedFood?.id === food.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                                        border: selectedFood?.id === food.id ? '1px solid var(--neon-blue)' : '1px solid transparent',
                                        borderRadius: '12px',
                                        marginBottom: '0.5rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{food.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{food.category}</div>
                                    </div>
                                    <div style={{ color: 'var(--neon-blue)', fontWeight: 'bold' }}>{food.calories} kcal <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(base)</span></div>
                                </div>
                            ))
                        ) : query && !loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No results found. Try another Indian dish!</div>
                        ) : null}
                    </div>

                    {/* Calorie Calculator */}
                    {selectedFood && (
                        <div className="glass-panel" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ color: 'var(--neon-blue)' }}>{selectedFood.name}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Base: {selectedFood.calories} kcal per {selectedFood.baseWeight || 100}g</p>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Enter weight in grams:</label>
                                <input
                                    type="number"
                                    step="10"
                                    className="form-control"
                                    value={weight}
                                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                                    style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}
                                />
                            </div>

                            <div style={{
                                background: 'rgba(0,0,0,0.2)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                textAlign: 'center',
                                border: '1px solid var(--brColor)'
                            }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ESTIMATED CALORIES</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--neon-orange)' }}>
                                    {calculateCalories(selectedFood, weight)}
                                    <span style={{ fontSize: '1rem', marginLeft: '5px' }}>kcal</span>
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', opacity: 0.7 }}>
                                <Info size={14} />
                                <span style={{ fontSize: '0.7rem' }}>Calculation based on standard Indian restaurant portions.</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JustCurious;
