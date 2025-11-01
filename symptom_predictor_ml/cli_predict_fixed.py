import sys
import os
import traceback
import json

# Disable multiprocessing issues
os.environ["JOBLIB_MULTIPROCESSING"] = "0"
os.environ["PYTHONHASHSEED"] = "1"

# === DEBUG info ===
print("=== DEBUG: sys.executable ===", file=sys.stderr)
print(sys.executable, file=sys.stderr)
print("=== DEBUG: sys.version ===", file=sys.stderr)
print(sys.version, file=sys.stderr)
print("=== DEBUG: sys.prefix ===", file=sys.stderr)
print(sys.prefix, file=sys.stderr)
print("=== DEBUG: sys.path ===", file=sys.stderr)
print(sys.path, file=sys.stderr)
print("=== DEBUG: VIRTUAL_ENV ===", file=sys.stderr)
print(os.environ.get("VIRTUAL_ENV", "None"), file=sys.stderr)
print("=== DEBUG: os.environ PATH ===", file=sys.stderr)
print(os.environ.get("PATH", "None"), file=sys.stderr)

# --- Safe imports ---
try:
    print("=== DEBUG: import numpy", file=sys.stderr)
    import numpy as np
    print("=== DEBUG: import numpy OK", file=sys.stderr)
except Exception:
    print("=== ERROR: import numpy failed ===", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    raise

try:
    print("=== DEBUG: import joblib", file=sys.stderr)
    import joblib
    print("=== DEBUG: import joblib OK", file=sys.stderr)
except Exception:
    print("=== ERROR: import joblib failed ===", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    raise

# --- Load models & encoders ---
BASE_DIR = os.path.dirname(__file__)
MODELS_DIR = os.path.join(BASE_DIR, "models")

MODEL_PATH = os.path.join(MODELS_DIR, "disease_predictor.joblib")
FEATURE_ENCODER_PATH = os.path.join(MODELS_DIR, "feature_encoder.joblib")
LABEL_ENCODER_PATH = os.path.join(MODELS_DIR, "label_encoder.joblib")
DISEASE_LABELS_PATH = os.path.join(MODELS_DIR, "disease_labels.txt")

try:
    model = joblib.load(MODEL_PATH)
    feature_encoder = joblib.load(FEATURE_ENCODER_PATH)
    label_encoder = joblib.load(LABEL_ENCODER_PATH)

    with open(DISEASE_LABELS_PATH, "r", encoding="utf-8") as f:
        disease_labels = [line.strip() for line in f.readlines()]
    print("=== DEBUG: Models loaded successfully ===", file=sys.stderr)
except Exception:
    print("=== ERROR: model or encoder loading failed ===", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    raise


# --- Prediction function ---
def predict(symptoms, prior_illnesses):
    try:
        # Encode symptoms into feature vector
        X = feature_encoder.transform([symptoms])

        pred_idx = model.predict(X)[0]
        proba = model.predict_proba(X)[0]

        result = {
            "prediction": disease_labels[pred_idx],
            "confidence": float(np.max(proba)),
            "top3": [
                {"disease": disease_labels[i], "confidence": float(prob)}
                for i, prob in sorted(enumerate(proba), key=lambda x: -x[1])[:3]
            ],
            "input_symptoms": symptoms,
            "prior_illnesses": prior_illnesses
        }
        return result

    except Exception as e:
        return {"error": str(e)}


# --- Main entrypoint ---
def main():
    if not sys.stdin.isatty():  
        # ✅ JSON stdin mode (Laravel)
        try:
            data = json.load(sys.stdin)
            symptoms = data.get("symptoms", [])
            prior_illnesses = data.get("prior_illnesses", [])
            result = predict(symptoms, prior_illnesses)
            print(json.dumps(result, ensure_ascii=False))
            return
        except Exception as e:
            print(json.dumps({"error": f"stdin parse failed: {e}"}))
            return

    # ✅ CLI args mode (manual testing)
    args = sys.argv[1:]
    if not args:
        print(json.dumps({"error": "No symptoms provided"}))
        return

    symptoms = args
    prior_illnesses = []
    result = predict(symptoms, prior_illnesses)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
