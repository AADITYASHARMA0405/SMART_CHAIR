# SmartChair: Posture Monitoring & Fatigue Analysis Platform

## Overview
SmartChair is an advanced, AI-powered ergonomic health monitoring system. It leverages real-time sensor data and machine learning to analyze sitting posture, predict user fatigue, and provide actionable health insights. The platform is designed to combat the negative effects of prolonged sitting, such as musculoskeletal pain and reduced circulation, by actively guiding users toward healthier habits.

The platform aligns with UN Sustainable Development Goals (SDG 3: Good Health and Well-being, and SDG 8: Decent Work and Economic Growth) by promoting healthier work environments and sustainable productivity.

## Key Features

### 1. Real-Time 3D Posture Simulation
The landing page features an interactive 3D chair model rendered with Three.js. The model serves as a visual anchor and dynamic representation of the system's capabilities, complete with custom clinical blue accents and sensor glows.

### 2. Live Dashboard & ML Prediction
- **Continuous Monitoring:** The dashboard simulates real-time data ingestion from embedded chair sensors.
- **Machine Learning Integration:** Uses a random forest classifier (exported as a lightweight JSON decision tree) trained on an Indian demographic dataset to accurately classify posture into six distinct categories: Good Posture, Slouching, Leaning Forward, Leaning Left, Leaning Right, and Leg Crossed.
- **Empty Chair Detection:** The system intelligently pauses monitoring when the user stands up.

### 3. Ergonomic Wisdom & Health Alerts
- **Actionable Insights:** Provides medical-grade advice on spinal decompression, lumbar support alignment, visual fatigue (20-20-20 rule), and circulatory motion.
- **Dynamic Alerts:** Generates real-time warnings for prolonged bad posture and celebrates streaks of perfect alignment.

### 4. Comprehensive Analytics
Visualizes historical posture distribution and fatigue trends using Chart.js, empowering users to track their ergonomic improvement over time.

## Technology Stack

### Frontend Architecture
- **HTML5 / CSS3:** Custom, responsive design system utilizing a clean Blue, Green, White, and Black clinical health theme.
- **Vite:** Next-generation frontend tooling for ultra-fast development and optimized production builds.
- **GSAP (GreenSock Animation Platform):** Sophisticated scroll-triggered animations and layout stabilization logic.

### 3D Rendering & Data Visualization
- **Three.js:** WebGL-based 3D engine powering the interactive chair simulation.
- **Chart.js:** Robust canvas-based charting for the analytics dashboard.

### Machine Learning
- **Python / scikit-learn:** Used offline to generate synthetic posture data and train the classification model.
- **Custom Inference Engine:** A bespoke JavaScript decision tree interpreter allows the pre-trained ML model to run natively in the browser without backend dependencies.

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher recommended)
- npm (Node Package Manager)

### Local Development
1. Clone the repository to your local machine.
2. Navigate to the project directory:
   ```bash
   cd d:/PROJECT
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5175` (or the port specified in your terminal).

## Building for Production
To generate an optimized, production-ready build:
```bash
npm run build
```
The compiled assets will be available in the `dist` directory, ready to be deployed to any static web hosting service.

## Project Structure
- `index.html`: The main entry point containing the full single-page application structure.
- `style.css`: Comprehensive design tokens, CSS variables, and responsive layout definitions.
- `main.js`: Core application logic orchestrating routing and component initialization.
- `js/animations.js`: GSAP scroll-trigger configurations and initialization logic.
- `js/three-scene.js`: Three.js setup, material definitions, and 3D modeling.
- `js/dashboard.js`: Live simulation logic, sensor data generation, and UI updates.
- `js/charts.js`: Chart.js configuration and analytics rendering.
- `js/ml-predictor.js`: The in-browser machine learning inference engine.
- `data/rf_model.json`: The exported decision tree configuration.

## License
This project is proprietary. All rights reserved.
