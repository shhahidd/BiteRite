const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase Configuration
const supabaseUrl = 'https://vvuradtmdbftxahfvusu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dXJhZHRtZGJmdHhhaGZ2dXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzYyNDIsImV4cCI6MjA4ODIxMjI0Mn0.RDz9W4pUKzaJQkAMA0TBm7I6bQRCVvsVR-K9ULfKlec';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

const foodDatasetPath = path.join(__dirname, 'foodDataset.json');
const mealDatasetPath = path.join(__dirname, 'mealDataset.json');
const userLogsPath = path.join(__dirname, 'userLogs.json');

const getUserLogs = () => {
    try {
        if (!fs.existsSync(userLogsPath)) {
            fs.writeFileSync(userLogsPath, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(userLogsPath, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (err) {
        console.error("Error reading userLogs:", err);
        return [];
    }
};

// Helper to read datasets (Ensures we always get what is on disk)
const getFoodDataset = () => {
    try {
        const data = JSON.parse(fs.readFileSync(foodDatasetPath, 'utf8'));
        return data;
    } catch (err) {
        console.error("Error reading foodDataset:", err);
        return [];
    }
};

const getMealDataset = () => {
    try {
        const data = JSON.parse(fs.readFileSync(mealDatasetPath, 'utf8'));
        return data;
    } catch (err) {
        console.error("Error reading mealDataset:", err);
        return { breakfast: [], lunch: [], dinner: [] };
    }
};

// POST /calculate
app.post('/calculate', (req, res) => {
    const { age, gender, height, weight, activity, goal } = req.body;
    if (!age || !gender || !height || !weight || !activity || !goal) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender === 'male') {
        bmr += 5;
    } else {
        bmr -= 161;
    }
    const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
    const tdee = bmr * (activityMultipliers[activity] || 1.2);
    let targetCalories = tdee;
    if (goal === 'lose weight') targetCalories -= 500;
    else if (goal === 'gain weight') targetCalories += 500;
    if (targetCalories < 1200) targetCalories = 1200;
    const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
    const proteinGrams = Math.round((targetCalories * 0.30) / 4);
    const carbsGrams = Math.round((targetCalories * 0.40) / 4);
    const fatGrams = Math.round((targetCalories * 0.30) / 9);

    res.json({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories: Math.round(targetCalories),
        bmi: parseFloat(bmi),
        weight: weight,
        macros: { protein: proteinGrams, carbs: carbsGrams, fat: fatGrams }
    });
});

// GET /mealplan
app.get('/mealplan', (req, res) => {
    const mealDataset = getMealDataset();
    const breakfast = mealDataset.breakfast[Math.floor(Math.random() * mealDataset.breakfast.length)];
    const lunch = mealDataset.lunch[Math.floor(Math.random() * mealDataset.lunch.length)];
    const dinner = mealDataset.dinner[Math.floor(Math.random() * mealDataset.dinner.length)];
    res.json({ breakfast, lunch, dinner });
});

// GET /foods
app.get('/foods', (req, res) => {
    res.json(getFoodDataset());
});

// GET /search-foods
app.get('/search-foods', async (req, res) => {
    const query = req.query.query;
    if (!query) return res.json([]);
    const lowerQuery = query.toLowerCase();

    try {
        // 1. Try fetching from Supabase FoodSource first
        const { data: supabaseFoods, error } = await supabase
            .from('FoodSource')
            .select('*')
            .ilike('Dish Name', `%${lowerQuery}%`)
            .limit(20);

        if (!error && supabaseFoods && supabaseFoods.length > 0) {
            console.log(`Found ${supabaseFoods.length} items in Supabase. First item:`, JSON.stringify(supabaseFoods[0]));
            // Map Supabase columns to frontend expected format
            // Based on user: Dish Name, Calories (kcal), Protein (g), Carbohydrates (g), Fats (g), BaseWeight
            const mappedFoods = supabaseFoods.map(food => ({
                id: food.id || food['Dish Name'],
                name: food['Dish Name'],
                calories: parseFloat(food['Calories (kcal)']) || 0,
                protein: parseFloat(food['Protein (g)']) || 0,
                carbs: parseFloat(food['Carbohydrates (g)']) || parseFloat(food['Carbs (g)']) || 0,
                fat: parseFloat(food['Fats (g)']) || parseFloat(food['Fat (g)']) || 0,
                baseWeight: parseFloat(food['BaseWeight']) || 100
            }));
            return res.json(mappedFoods);
        }
        if (!error && (!supabaseFoods || supabaseFoods.length === 0)) {
            console.log(`No items found in Supabase for query: ${lowerQuery}`);
        }
    } catch (err) {
        console.error("Supabase search exception:", err);
    }

    // 2. Fallback to local foodDataset.json
    console.log("Falling back to local foodDataset.json");
    const foodDataset = getFoodDataset() || [];
    const results = foodDataset.filter(food => food.name.toLowerCase().includes(lowerQuery));

    // Force direct comparison to ensure no legacy tokens are lingering (Cleanup logic)
    const cleanResults = results.filter(food => {
        const legacyNames = ['savory chicken', 'spicy tempeh', 'spicy pork', 'steamed chicken', 'spicy salmon'];
        return !legacyNames.some(legacy => food.name.toLowerCase().includes(legacy)) ||
            (food.name.toLowerCase().includes('chicken') && (food.name.toLowerCase().includes('curry') || food.name.toLowerCase().includes('grilled')));
    });

    res.json(cleanResults.slice(0, 10));
});

if (!fs.existsSync(userLogsPath)) fs.writeFileSync(userLogsPath, JSON.stringify([]));

// POST /log-food
app.post('/log-food', async (req, res) => {
    const { foodId, mealType, date, weight } = req.body;
    if (!foodId || !mealType || !date || !weight) return res.status(400).json({ error: 'Missing required parameters' });

    const w = parseFloat(weight) || 100;
    let food = null;

    // 1. Try finding in Supabase
    try {
        // Flexible lookup: by ID (if numeric) or by Dish Name
        let query = supabase.from('FoodSource').select('*');
        if (!isNaN(foodId)) {
            query = query.or(`id.eq.${foodId},"Dish Name".eq."${foodId}"`);
        } else {
            query = query.eq('Dish Name', foodId);
        }

        const { data, error } = await query.maybeSingle();

        if (!error && data) {
            console.log("Found food in Supabase for logging:", data['Dish Name']);
            food = {
                id: data.id || data['Dish Name'],
                name: data['Dish Name'],
                calories: parseFloat(data['Calories (kcal)']) || parseFloat(data['calories']) || 0,
                protein: parseFloat(data['Protein (g)']) || parseFloat(data['protein']) || 0,
                carbs: parseFloat(data['Carbs (g)']) || parseFloat(data['carbs']) || parseFloat(data['Carbohydrates (g)']) || 0,
                fat: parseFloat(data['Fat (g)']) || parseFloat(data['fat']) || parseFloat(data['Fats (g)']) || 0,
                baseWeight: parseFloat(data['BaseWeight']) || 100
            };
        } else if (error) {
            console.error("Supabase lookup error for logging:", error);
        }
    } catch (err) {
        console.error("Supabase fetch exception for logging:", err);
    }

    // 2. Fallback to local dataset
    if (!food) {
        const foodDataset = getFoodDataset() || [];
        food = foodDataset.find(f => f.id === foodId);
    }

    if (!food) return res.status(404).json({ error: 'Food not found' });

    // Multiplier = (Entered Weight / Base Weight)
    const multiplier = w / (food.baseWeight || 100);

    try {
        const logs = getUserLogs();
        const newLog = {
            id: Date.now(),
            date,
            mealType,
            weight: w,
            food: {
                id: food.id,
                name: food.name,
                calories: Math.round(food.calories * multiplier),
                protein: parseFloat((food.protein * multiplier).toFixed(1)),
                carbs: parseFloat((food.carbs * multiplier).toFixed(1)),
                fat: parseFloat((food.fat * multiplier).toFixed(1))
            }
        };
        logs.push(newLog);
        fs.writeFileSync(userLogsPath, JSON.stringify(logs, null, 2));
        res.json({ success: true, log: newLog });
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

// POST /log-fasting
app.post('/log-fasting', (req, res) => {
    const { date, startTime, endTime } = req.body;
    if (!date || !startTime || !endTime) return res.status(400).json({ error: 'Missing required parameters' });
    try {
        const logs = getUserLogs();
        const newLog = { id: Date.now(), date, type: 'fasting', startTime, endTime };
        logs.push(newLog);
        fs.writeFileSync(userLogsPath, JSON.stringify(logs, null, 2));
        res.json({ success: true, log: newLog });
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

// GET /daily-summary
app.get('/daily-summary', (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Missing date' });
    try {
        const logs = getUserLogs();
        const todaysLogs = logs.filter(log => log.date === date && (log.food || log.type === 'activity'));
        const todaysFast = logs.find(log => log.date === date && log.type === 'fasting');

        const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        const meals = { breakfast: [], snack1: [], lunch: [], snack2: [], dinner: [] };
        const activities = { steps: 0, sleep: 0, workout: 0 };
        let burnedCalories = 0;

        todaysLogs.forEach(log => {
            if (log.food) {
                totals.calories += log.food.calories;
                totals.protein += log.food.protein;
                totals.carbs += log.food.carbs;
                totals.fat += log.food.fat;
                if (meals[log.mealType]) meals[log.mealType].push(log);
            } else if (log.type === 'activity') {
                const val = parseFloat(log.value) || 0;
                if (activities.hasOwnProperty(log.activityType)) {
                    activities[log.activityType] += val;
                }
                // Estimate burnt calories
                if (log.activityType === 'steps') burnedCalories += val * 0.04;
                if (log.activityType === 'workout') burnedCalories += val * 8;
            }
        });
        res.json({
            date,
            totals,
            meals,
            fasting: todaysFast || null,
            activities,
            burnedCalories: Math.round(burnedCalories)
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

// GET /weekly-summary
app.get('/weekly-summary', (req, res) => {
    try {
        const logs = getUserLogs();
        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayLogs = logs.filter(log => log.date === dateStr && log.food);
            const totalCals = dayLogs.reduce((sum, log) => sum + log.food.calories, 0);
            const totalProtein = dayLogs.reduce((sum, log) => sum + log.food.protein, 0);
            const totalCarbs = dayLogs.reduce((sum, log) => sum + log.food.carbs, 0);
            const totalFat = dayLogs.reduce((sum, log) => sum + log.food.fat, 0);
            days.push({
                date: dateStr,
                label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                calories: totalCals,
                macros: { protein: totalProtein, carbs: totalCarbs, fat: totalFat }
            });
        }
        res.json(days);
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

// GET /history
app.get('/history', (req, res) => {
    try {
        const daysParam = parseInt(req.query.days) || 7;
        const logs = getUserLogs();
        const today = new Date();
        const history = [];
        for (let i = 0; i < daysParam; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayLogs = logs.filter(log => log.date === dateStr);

            const summary = {
                calories: 0,
                steps: 0,
                sleep: 0,
                workout: 0
            };

            dayLogs.forEach(l => {
                if (l.food) {
                    summary.calories += l.food.calories;
                } else if (l.type === 'activity') {
                    if (summary.hasOwnProperty(l.activityType)) {
                        summary[l.activityType] += parseFloat(l.value) || 0;
                    }
                }
            });

            history.push({
                date: dateStr,
                label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                summary
            });
        }
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

// GET /grocery-list
// GET /predict-grocery
app.get('/predict-grocery', (req, res) => {
    try {
        const logs = getUserLogs();
        const mealDataset = getMealDataset();
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        // Get logs from last 7 days
        const recentLogs = logs.filter(log => {
            if (!log.date || !log.food) return false;
            const logDate = new Date(log.date);
            return logDate >= sevenDaysAgo;
        });

        // Map dishes to ingredients
        const predictedIngredients = {};
        const allPossibleMeals = [...mealDataset.breakfast, ...mealDataset.lunch, ...mealDataset.dinner];

        recentLogs.forEach(log => {
            const mealData = allPossibleMeals.find(m => m.name === log.food.name);
            if (mealData && mealData.ingredients) {
                mealData.ingredients.forEach(ing => {
                    predictedIngredients[ing] = (predictedIngredients[ing] || 0) + 1;
                });
            } else {
                // If not in our dataset, just add the food name itself as an ingredient
                predictedIngredients[log.food.name] = (predictedIngredients[log.food.name] || 0) + 1;
            }
        });

        const list = Object.entries(predictedIngredients).map(([name, count]) => ({
            name,
            estimation: `Expected ${count} usage(s) next week`
        }));

        res.json(list);
    } catch (err) {
        console.error("Grocery prediction error:", err);
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/grocery-list', (req, res) => {
    try {
        const logs = getUserLogs();
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        const recentLogs = logs.filter(log => {
            if (!log.date || !log.food) return false;
            const logDate = new Date(log.date);
            return logDate >= sevenDaysAgo;
        });

        const groceryMap = {};
        recentLogs.forEach(log => {
            const name = log.food.name;
            if (groceryMap[name]) {
                groceryMap[name].quantity += 1;
            } else {
                groceryMap[name] = { name, quantity: 1, unit: 'servings' };
            }
        });

        const list = Object.values(groceryMap).map(item => ({
            ...item,
            estimation: `${item.quantity} ${item.unit}`
        }));
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

// GET /activity-trends
app.get('/activity-trends', (req, res) => {
    try {
        const logs = getUserLogs();
        const trends = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const dayLogs = logs.filter(log => log.date === dateStr && log.type === 'activity');
            const dayStats = { date: dateStr, steps: 0, sleep: 0, workout: 0 };

            dayLogs.forEach(log => {
                if (dayStats.hasOwnProperty(log.activityType)) {
                    dayStats[log.activityType] += parseFloat(log.value) || 0;
                }
            });
            trends.push(dayStats);
        }

        // Calculate Streak
        let streak = 0;
        const allDates = [...new Set(logs.filter(l => l.type === 'activity').map(l => l.date))].sort().reverse();

        for (let dateStr of allDates) {
            const dayLogs = logs.filter(log => log.date === dateStr && log.type === 'activity');
            const steps = dayLogs.filter(l => l.activityType === 'steps').reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
            const workout = dayLogs.filter(l => l.activityType === 'workout').reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);

            if (steps >= 10000 || workout >= 30) {
                streak++;
            } else {
                break; // Streak broken
            }
        }

        res.json({ trends, streak });
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

// POST /log-activity (Steps, Sleep, Workout)
app.post('/log-activity', (req, res) => {
    const { type, value, date, unit } = req.body;
    if (!type || !value || !date) return res.status(400).json({ error: 'Missing parameters' });
    try {
        const logs = getUserLogs();
        const newLog = { id: Date.now(), date, type: 'activity', activityType: type, value, unit };
        logs.push(newLog);
        fs.writeFileSync(userLogsPath, JSON.stringify(logs, null, 2));
        res.json({ success: true, log: newLog });
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

// POST /fridge-meals
app.post('/fridge-meals', (req, res) => {
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients)) return res.status(400).json({ error: 'Invalid' });

    const lowerIngs = ingredients.map(i => i.toLowerCase().trim());
    const matchesMap = new Map();
    const mealDataset = getMealDataset();

    // Search in mealDataset INGREDIENTS
    ['breakfast', 'lunch', 'dinner'].forEach(cat => {
        mealDataset[cat].forEach(meal => {
            const mealIngs = meal.ingredients.map(i => i.toLowerCase());
            // If meal contains ANY of the fridge ingredients
            if (lowerIngs.some(i => mealIngs.some(mi => mi.includes(i)))) {
                matchesMap.set(meal.name, { ...meal, category: cat, type: 'meal' });
            }
        });
    });

    res.json(Array.from(matchesMap.values()).slice(0, 10));
});

// POST /api/ai/chat (Proxy to local Ollama)
app.post('/api/ai/chat', async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Invalid messages' });

    try {
        // Load custom knowledge base
        const knowledgePath = path.join(__dirname, 'nutrition_knowledge.txt');
        let knowledge = '';
        if (fs.existsSync(knowledgePath)) {
            knowledge = fs.readFileSync(knowledgePath, 'utf8');
        }

        const response = await axios.post('http://127.0.0.1:11434/api/chat', {
            model: 'phi3',
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful AI Nutritional Assistant integrated into a premium health planner app. 
                    You specialize in Indian cuisine, healthy living, and personalized nutrition advice. 
                    Ground your responses in the following knowledge base:
                    
                    ${knowledge}
                    
                    Keep your responses concise, encouraging, and informative. If the user asks something outside this knowledge, answer to the best of your ability while staying health-focused.`
                },
                ...messages
            ],
            stream: false
        });

        res.json(response.data.message);
    } catch (err) {
        console.error('Ollama Error:', err.message);
        res.status(503).json({ error: 'AI Assistant is currently offline. Please ensure Ollama is running.' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
