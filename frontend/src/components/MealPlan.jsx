import React, { useMemo } from 'react';

const MealPlan = ({ mealPlan }) => {
    if (!mealPlan) return null;

    const { breakfast, lunch, dinner } = mealPlan;

    // Extract ingredients for the grocery list
    const groceryList = useMemo(() => {
        const allIngredients = [
            ...breakfast.ingredients,
            ...lunch.ingredients,
            ...dinner.ingredients
        ];
        // Remove duplicates and sort
        return [...new Set(allIngredients)].sort();
    }, [breakfast, lunch, dinner]);

    const renderMeal = (title, meal) => (
        <div className="meal-category">
            <h3>{title}</h3>
            <div className="meal-item">
                <div>
                    <strong style={{ fontSize: '1.125rem' }}>{meal.name}</strong>
                    <div style={{ color: 'var(--accent-yellow)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {meal.calories} kcal
                    </div>
                    <div>
                        {meal.ingredients.map((ing, idx) => (
                            <span key={idx} className="ingredient-badge">{ing}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="grid" style={{ gap: '2rem' }}>
            <div className="card">
                <h2>Your Daily Menu</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Generated based on your goals.</p>

                {renderMeal('Breakfast', breakfast)}
                {renderMeal('Lunch', lunch)}
                {renderMeal('Dinner', dinner)}
            </div>

            <div className="card">
                <h2>Grocery List</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Ingredients needed for today's meals.</p>

                <ul className="grocery-list">
                    {groceryList.map((item, idx) => (
                        <li key={idx}>{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default MealPlan;
