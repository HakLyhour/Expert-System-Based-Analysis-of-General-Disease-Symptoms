import pandas as pd
import mysql.connector
import xgboost as xgb
import joblib
import os
import sys
from sklearn.preprocessing import MultiLabelBinarizer, LabelEncoder
from sklearn.metrics import accuracy_score
from itertools import combinations
import unicodedata

def normalize_name(name: str) -> str:
    """Normalize disease names (fix curly quotes, dashes, spaces)."""
    if not isinstance(name, str):
        return name
    return (unicodedata.normalize("NFKD", name)
            .replace("’", "'")
            .replace("‘", "'")
            .replace("“", '"')
            .replace("”", '"')
            .replace("–", "-")
            .strip())

# ==============================
# 1. Load data from MySQL view
# ==============================
def load_data():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="pikrus_db"
    )

    query = """
    SELECT d.diseases_name AS disease, k.symptoms, k.priorillnesses
    FROM v_knowledgebases k
    JOIN diseases d ON d.diseases_name = k.disease
    """
    df = pd.read_sql(query, conn)
    conn.close()

    # Normalize disease names
    df['disease'] = df['disease'].apply(normalize_name)

    if df.empty:
        print("❌ ERROR: v_knowledgebases is empty! Cannot continue.")
        sys.exit(1)

    # Normalize
    df['symptom_list'] = df['symptoms'].fillna("").apply(
        lambda x: [s.strip() for s in x.split(",") if s.strip()]
    )
    df['prior_list'] = df['priorillnesses'].fillna("").apply(
        lambda x: [p.strip() for p in x.split(",") if p.strip()]
    )
    df['features'] = df['symptom_list'] + df['prior_list']

    print(f"⚡ Loaded {len(df)} base rows")
    return df


def expand_samples(df, max_subset_size=3):
    """Expand knowledgebase rows into smaller subsets (deterministic)."""
    expanded_rows = []

    for _, row in df.iterrows():
        features = row['features']
        disease = row['disease']

        # Generate all subsets up to max_subset_size
        for k in range(1, min(len(features), max_subset_size) + 1):
            for combo in combinations(features, k):
                expanded_rows.append({
                    "features": list(combo),
                    "disease": disease
                })

    expanded_df = pd.DataFrame(expanded_rows)
    print(f"⚡ Loaded {len(df)} base rows")
    print(f"⚡ Expanded into {len(expanded_df)} training samples (deterministic subsets)")
    return expanded_df


# ==============================
# 2. Preprocess
# ==============================
def preprocess(df):
    mlb = MultiLabelBinarizer()
    X = mlb.fit_transform(df['features'])

    le = LabelEncoder()
    y = le.fit_transform(df['disease'])

    print(f"⚡ Expanded into {len(X)} training samples")
    print(f"🔧 Encoded {len(mlb.classes_)} features and {len(le.classes_)} diseases")

    print("=== Learned features (symptoms + prior illnesses) ===")
    print(mlb.classes_)
    print("Total features:", len(mlb.classes_))

    print("=== Learned disease names ===")
    print(le.classes_)
    print("Total diseases:", len(le.classes_))

    return X, y, mlb, le

# ==============================
# 3. Train on ALL data
# ==============================
def train(X, y):
    model = xgb.XGBClassifier(
        eval_metric="mlogloss",
        use_label_encoder=False,
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        random_state=42
    )

    model.fit(X, y)
    acc = accuracy_score(y, model.predict(X))
    print(f"✅ Training complete on ALL data. Accuracy: {acc:.2f}")
    return model

# ==============================
# 4. Save model + encoders
# ==============================
def save(model, mlb, le):
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/disease_predictor.joblib")
    joblib.dump(le, "models/label_encoder.joblib")
    joblib.dump(mlb, "models/feature_encoder.joblib")

    with open("models/disease_labels.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(list(le.classes_)))

    print(f"💾 Saved model + {len(le.classes_)} disease labels to /models")

# ==============================
# 5. Run training
# ==============================
if __name__ == "__main__":
    df = load_data()
    df = expand_samples(df, max_subset_size=3)
    X, y, mlb, le = preprocess(df)
    model = train(X, y)
    save(model, mlb, le)