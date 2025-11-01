from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import joblib
import os
import numpy as np

# ==============================
# Load trained model + encoders
# ==============================
if not os.path.exists("models/label_encoder.joblib") or not os.path.exists("models/feature_encoder.joblib"):
    raise FileNotFoundError("Missing encoders! Please run train_model.py first.")

model = joblib.load("models/disease_predictor.joblib")
label_encoder = joblib.load("models/label_encoder.joblib")
feature_encoder = joblib.load("models/feature_encoder.joblib")  # MultiLabelBinarizer

# ==============================
# FastAPI app
# ==============================
app = FastAPI(title="Disease Prediction API", version="1.0")

# Input schema
class SymptomInput(BaseModel):
    symptoms: List[str]  # list of symptom/prior illness names

# ==============================
# Predict Endpoint
# ==============================
@app.post("/predict")
async def predict(input: SymptomInput):
    try:
        if not input.symptoms:
            return {"error": "No symptoms provided."}

        # 🔹 Transform symptoms into multi-hot vector
        input_vector = feature_encoder.transform([input.symptoms])

        # 🔹 Get probabilities for all diseases
        probs = model.predict_proba(input_vector)[0]

        # 🔹 Sort top 3 predictions
        top_indices = np.argsort(probs)[::-1][:3]
        top_predictions = []
        for idx in top_indices:
            disease = label_encoder.inverse_transform([idx])[0]
            confidence = float(probs[idx])
            confidence = min(confidence, 0.90)  # cap at 90%
            top_predictions.append({
                "disease": disease,
                "confidence": round(confidence, 2)
            })

        # 🔹 Best prediction is first one
        best_prediction = top_predictions[0]

        return {
            "prediction": best_prediction["disease"],
            "confidence": best_prediction["confidence"],
            "alternatives": top_predictions,
            "input_symptoms": input.symptoms
        }

    except Exception as e:
        return {"error": str(e)}
