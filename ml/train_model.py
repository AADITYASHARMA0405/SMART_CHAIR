import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import json
import os

# Set random seed for reproducibility
np.random.seed(42)

# Parameters for Indian demographics
# Average weight (adult urban population): ~62kg. Range: 45kg to 95kg.
NUM_SAMPLES_PER_CLASS = 1200 # Increased for better generalization

# Classes:
# 0: Upright (Ideal)
# 1: Slouching
# 2: Leaning Left
# 3: Leaning Right
# 4: Forward
# 5: Reclined

def generate_sensor_data(posture_class, weight):
    # Sensors: Seat_FL, Seat_FR, Seat_BL, Seat_BR, Lumbar_L, Lumbar_R
    # IMU: Pitch (forward/back tilt), Roll (left/right tilt)
    
    # Base noise
    noise = lambda scale: np.random.normal(0, scale)
    
    # Weight scaling factor
    # ADC range 0-1023. We map the weight to a base pressure.
    w_base = (weight / 80.0) * 700 

    if posture_class == 0:  # Upright
        seat_fl, seat_fr, seat_bl, seat_br = w_base * 0.22, w_base * 0.22, w_base * 0.28, w_base * 0.28
        lumbar_l, lumbar_r = w_base * 0.15, w_base * 0.15
        pitch, roll = 0.0 + noise(2), 0.0 + noise(1)
        
    elif posture_class == 1:  # Slouching
        seat_fl, seat_fr, seat_bl, seat_br = w_base * 0.10, w_base * 0.10, w_base * 0.45, w_base * 0.45
        lumbar_l, lumbar_r = w_base * 0.05, w_base * 0.05
        pitch, roll = 18.0 + noise(4), 0.0 + noise(1)
        
    elif posture_class == 2:  # Leaning Left
        seat_fl, seat_fr, seat_bl, seat_br = w_base * 0.40, w_base * 0.10, w_base * 0.40, w_base * 0.10
        lumbar_l, lumbar_r = w_base * 0.25, w_base * 0.05
        pitch, roll = 0.0 + noise(3), -15.0 + noise(3)
        
    elif posture_class == 3:  # Leaning Right
        seat_fl, seat_fr, seat_bl, seat_br = w_base * 0.10, w_base * 0.40, w_base * 0.10, w_base * 0.40
        lumbar_l, lumbar_r = w_base * 0.05, w_base * 0.25
        pitch, roll = 0.0 + noise(3), 15.0 + noise(3)

    elif posture_class == 4:  # Forward
        seat_fl, seat_fr, seat_bl, seat_br = w_base * 0.45, w_base * 0.45, w_base * 0.10, w_base * 0.10
        lumbar_l, lumbar_r = 0.0 + noise(5), 0.0 + noise(5)
        pitch, roll = -15.0 + noise(3), 0.0 + noise(1)
        
    elif posture_class == 5:  # Reclined
        seat_fl, seat_fr, seat_bl, seat_br = w_base * 0.12, w_base * 0.12, w_base * 0.25, w_base * 0.25
        lumbar_l, lumbar_r = w_base * 0.35, w_base * 0.35
        pitch, roll = 28.0 + noise(5), 0.0 + noise(1)
        
    # Apply noise and clamp
    sensors = [seat_fl, seat_fr, seat_bl, seat_br, lumbar_l, lumbar_r]
    sensors = [max(0, min(1023, int(s + noise(15)))) for s in sensors]
    
    return [weight] + sensors + [pitch, roll, posture_class]

def export_to_json(model, feature_names, class_names, filepath):
    """Exports a Random Forest model structure to JSON for browser usage."""
    forest = []
    for tree in model.estimators_:
        forest.append(export_tree(tree.tree_))
    
    output = {
        "features": list(feature_names),
        "classes": class_names,
        "forest": forest
    }
    
    with open(filepath, 'w') as f:
        json.dump(output, f)
    print(f"Model exported to JSON: {filepath}")

def export_tree(tree):
    """Recursive function to export a single decision tree."""
    def get_node(node_id):
        if tree.children_left[node_id] == -1: # Leaf
            # Return value (class probabilities)
            probs = tree.value[node_id][0].tolist()
            return {"leaf": True, "value": probs}
        else:
            return {
                "leaf": False,
                "feature": int(tree.feature[node_id]),
                "threshold": float(tree.threshold[node_id]),
                "left": get_node(tree.children_left[node_id]),
                "right": get_node(tree.children_right[node_id])
            }
    return get_node(0)

print("--- SmartChair ML Training (Indian Demographic Alignment) ---")
print("Generating synthetic dataset...")
dataset = []
for c in range(6):
    for _ in range(NUM_SAMPLES_PER_CLASS):
        # Indian weights: Mean 62kg, SD 14kg (Adults)
        weight = np.clip(np.random.normal(62, 14), 45, 100) 
        row = generate_sensor_data(c, weight)
        dataset.append(row)

columns = ['Weight_kg', 'Seat_FL', 'Seat_FR', 'Seat_BL', 'Seat_BR', 'Lumbar_L', 'Lumbar_R', 'IMU_Pitch', 'IMU_Roll', 'Posture_Class']
df = pd.DataFrame(dataset, columns=columns)

# Save dataset
os.makedirs('data', exist_ok=True)
df.to_csv('data/posture_dataset_indian.csv', index=False)
print(f"Dataset saved (Size: {df.shape})")

# Prepare for training
X = df.drop(['Posture_Class', 'Weight_kg'], axis=1) 
y = df['Posture_Class']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training Random Forest...")
model = RandomForestClassifier(n_estimators=30, max_depth=8, random_state=42) # Optimized for size/browser performance
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {acc * 100:.2f}%")

# Save model (JSON for Web and PKL for Python)
os.makedirs('models', exist_ok=True)
class_names = ['Upright', 'Slouching', 'Lean Left', 'Lean Right', 'Forward', 'Reclined']
export_to_json(model, X.columns, class_names, 'models/posture_model.json')

import pickle
with open('models/posture_rf_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("Process complete.")
