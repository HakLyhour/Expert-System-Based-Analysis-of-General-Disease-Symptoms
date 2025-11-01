import mysql.connector
import pandas as pd
import sys

def load_data():
    conn = mysql.connector.connect(
        host="localhost",      # ⚡ DB host
        user="root",           # ⚡ DB username
        password="",           # ⚡ DB password
        database="pikrus_db"   # ⚡ Your Laravel DB
    )

    query = "SELECT * FROM v_knowledgebases"
    df = pd.read_sql(query, conn)

    conn.close()

    # 🚨 Check if empty
    if df.empty:
        print("❌ ERROR: v_knowledgebases is empty! Cannot continue.")
        sys.exit(1)

    return df

if __name__ == "__main__":
    df = load_data()
    print(f"📊 Loaded {df.shape[0]} rows and {df.shape[1]} columns")
    print(df.head(10))  # show 10 rows for inspection
