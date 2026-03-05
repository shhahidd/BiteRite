import React, { useState } from 'react';

const UserForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem('userProfileForm');
        return saved ? JSON.parse(saved) : {
            age: '',
            gender: 'male',
            height: '',
            weight: '',
            activity: 'sedentary',
            goal: 'maintain weight',
            profilePic: ''
        };
    });

    const handleChange = (e) => {
        const newData = { ...formData, [e.target.name]: e.target.value };
        setFormData(newData);
        localStorage.setItem('userProfileForm', JSON.stringify(newData));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('userProfileForm', JSON.stringify(formData));
        onSubmit(formData);
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '800px' }}>
            <h2>Profile Setup</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Enter your details to generate your plan.</p>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label>Age (years)</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className="form-control"
                            required
                            min="10"
                            max="120"
                        />
                    </div>
                    <div className="form-group">
                        <label>Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="form-control">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Height (cm)</label>
                        <input
                            type="number"
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                            className="form-control"
                            required
                            min="100"
                            max="250"
                        />
                    </div>
                    <div className="form-group">
                        <label>Weight (kg)</label>
                        <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            className="form-control"
                            required
                            min="30"
                            max="300"
                        />
                    </div>
                    <div className="form-group">
                        <label>Activity Level</label>
                        <select name="activity" value={formData.activity} onChange={handleChange} className="form-control">
                            <option value="sedentary">Sedentary (little to no exercise)</option>
                            <option value="light">Light (exercise 1-3 days/week)</option>
                            <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                            <option value="active">Active (exercise 6-7 days/week)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Goal</label>
                        <select name="goal" value={formData.goal} onChange={handleChange} className="form-control">
                            <option value="lose weight">Lose Weight</option>
                            <option value="maintain weight">Maintain Weight</option>
                            <option value="gain weight">Gain Weight</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Profile Picture URL (DP)</label>
                        <input
                            type="url"
                            name="profilePic"
                            placeholder="https://example.com/photo.jpg"
                            value={formData.profilePic || ''}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <button type="submit" className="btn-primary">Update Profile</button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;
