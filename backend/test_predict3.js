const fs = require('fs');

try {
    const userLogsPath = 'C:/Users/ShahidPatel/.gemini/antigravity/scratch/ai-nutrition-planner/backend/userLogs.json';
    const mealDatasetPath = 'C:/Users/ShahidPatel/.gemini/antigravity/scratch/ai-nutrition-planner/backend/mealDataset.json';
    const logs = JSON.parse(fs.readFileSync(userLogsPath, 'utf8'));
    const mealDataset = JSON.parse(fs.readFileSync(mealDatasetPath, 'utf8'));
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    let out = `Today: ${today.toISOString()}\nSeven days ago: ${sevenDaysAgo.toISOString()}\n`;

    const recentLogs = logs.filter(log => {
        if (!log.date || !log.food) return false;
        const logDate = new Date(log.date);
        return logDate >= sevenDaysAgo;
    });

    out += `Recent logs count: ${recentLogs.length}\n`;

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

    out += `Predicted List: ${JSON.stringify(list, null, 2)}\n`;
    fs.writeFileSync('C:/Users/ShahidPatel/.gemini/antigravity/scratch/ai-nutrition-planner/backend/test_predict_out3.txt', out);
} catch (err) {
    fs.writeFileSync('C:/Users/ShahidPatel/.gemini/antigravity/scratch/ai-nutrition-planner/backend/test_predict_out3.txt', 'Error: ' + err.toString());
}
