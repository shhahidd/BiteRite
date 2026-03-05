AI Nutrition Planner

AI Nutrition Planner is a web application that helps users quickly check the nutritional values of foods and get intelligent nutrition guidance. The system combines a structured nutrition dataset with a locally running AI model to answer health and fitness related questions.

The goal of the project is to provide a simple nutrition assistant that can estimate calories, macros, and provide basic dietary insights for Indian food items.

Features

Food Nutrition Lookup
Search foods and instantly view calories, protein, carbohydrates, and fats.

AI Nutrition Assistant
Ask questions about diet, fitness, or food nutrition and receive AI generated responses.

Meal Nutrition Awareness
Understand the nutritional composition of common Indian dishes.

Local AI Processing
The AI model runs locally using Ollama so no external API calls are required.

Dataset Driven Accuracy
Uses a processed Indian food nutrition dataset containing over 1000 food items.

Tech Stack

Frontend
React

Backend
Node.js
Express.js

AI Model
Phi 3 Mini running locally using Ollama

Data
Indian Food Nutrition Dataset (CSV converted to JSON)

System Architecture

User Interface (React)
↓
Backend API (Node.js + Express)
↓
Nutrition Dataset Lookup
↓
AI Model via Ollama (Phi 3 Mini)

The system first checks the nutrition dataset for exact information. If the user asks a general health or diet related question, the request is sent to the AI model.

Installation

Clone the repository

git clone https://github.com/yourusername/ai-nutrition-planner.git cd ai-nutrition-planner 

Install backend dependencies

npm install 

Install frontend dependencies

cd frontend npm install 

Running the AI Model

Install Ollama

https://ollama.com

Download the Phi 3 model

ollama run phi3 

Start the Ollama server

ollama serve 

The model will now run locally and be accessible via

http://localhost:11434 

Running the Project

Start the backend server

node server.js 

Start the frontend

npm start 

Open the application in your browser

http://localhost:3000 

Example Queries

How many calories are in dosa
Is paneer good for muscle gain
Which foods are high in protein
What foods help with weight loss

Project Structure

ai-nutrition-planner │ ├── backend │ ├── server.js │ ├── nutrition_knowledge.txt │ └── foods.json │ ├── frontend │ ├── src │ ├── components │ └── App.js │ └── dataset └── Indian_Food_Nutrition_Processed.csv 

Future Improvements

Personalized diet recommendations
Meal plan generation based on calorie targets
Food image recognition for nutrition estimation
Integration with wearable health devices

Disclaimer

This application provides general nutritional information and should not be considered medical advice. Users should consult qualified healthcare professionals for dietary recommendations.

License

This project is released under the MIT License.

