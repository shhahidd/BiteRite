const fs = require('fs');
const path = require('path');

const userLogsPath = 'C:/Users/ShahidPatel/.gemini/antigravity/scratch/ai-nutrition-planner/backend/userLogs.json';
const mealDatasetPath = 'C:/Users/ShahidPatel/.gemini/antigravity/scratch/ai-nutrition-planner/backend/mealDataset.json';

const logs = JSON.parse(fs.readFileSync(userLogsPath, 'utf8'));
const mealDataset = JSON.parse(fs.readFileSync(mealDatasetPath, 'utf8'));

const today = new Date();
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(today.getDate() - 7);

console.log("Today:", today.toISOString());
console.log("Seven days ago:", sevenDaysAgo.toISOString());

const recentLogs = logs.filter(log => {
    if (!log.date || !log.food) return false;
    const logDate = new Date(log.date);
    const isRecent = logDate >= sevenDaysAgo;
    // console.log(`Date: ${log.date} (${logDate.toISOString()}), Recent: ${isRecent}`);
    return isRecent;
});

console.log("Recent logs count:", recentLogs.length);

const predictedIngredients = {};
const allPossibleMeals = [...mealDataset.breakfast, ...mealDataset.lunch, ...mealDataset.dinner];

recentLogs.forEach(log => {
    const mealData = allPossibleMeals.find(m => m.name === log.food.name);
    if (mealData && mealData.ingredients) {
        mealData.ingredients.forEach(ing => {
            predictedIngredients[ing] = (predictedIngredients[ing] || 0) + 1;
        });
    } else {
        predictedIngredients[log.food.name] = (predictedIngredients[log.food.name] || 0) + 1;
    }
});

const list = Object.entries(predictedIngredients).map(([name, count]) => ({
    name,
    estimation: `Expected ${count} usage(s) next week`
}));

console.log("Predicted List:", JSON.stringify(list, null, 2));
