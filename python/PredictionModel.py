import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras import Sequential, layers  # Ignore
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt

# -----------------------------
# 1. Load Dataset
# -----------------------------
df = pd.read_csv("python/data/synthetic_power_data.csv")

print(df.head())
print("Shape:", df.shape)
print("Summary:\n", df.describe())

# Extract only the power column
power = df["power_W"].to_numpy().reshape(-1, 1)

# Normalize (LSTM trains better on scaled data)
scaler = MinMaxScaler()
power_scaled = scaler.fit_transform(power)

# -----------------------------
# 2. Prepare Dataset for LSTM
# -----------------------------
def create_sequences(data, input_seq=60, output_seq=10):
    X, y = [], []
    for i in range(len(data) - input_seq - output_seq):
        X.append(data[i : i + input_seq])
        y.append(data[i + input_seq : i + input_seq + output_seq].flatten())
    return np.array(X), np.array(y)

INPUT_SEQ = 60
OUTPUT_SEQ = 10
X, y = create_sequences(power_scaled, INPUT_SEQ, OUTPUT_SEQ)

print(f"X shape: {X.shape}, y shape: {y.shape}")

# Train-test split
split_idx = int(len(X) * 0.8)
X_train, y_train = X[:split_idx], y[:split_idx]
X_test, y_test = X[split_idx:], y[split_idx:]

# -----------------------------
# 3. Define the LSTM Model
# -----------------------------
def build_lstm_forecaster(input_seq=60, output_seq=10):
    model = Sequential([
        layers.Input(shape=(input_seq, 1)),
        layers.LSTM(64, return_sequences=False),
        layers.Dense(32, activation="relu"),
        layers.Dense(output_seq)
    ])
    model.compile(optimizer="adam", loss="mse")
    return model

model = build_lstm_forecaster(INPUT_SEQ, OUTPUT_SEQ)
model.summary()

# -----------------------------
# 4. Train Model
# -----------------------------
EPOCHS = 20
BATCH_SIZE = 32

history = model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=EPOCHS,
    batch_size=BATCH_SIZE,
    verbose=1
)

# -----------------------------
# 5. Evaluate & Forecast
# -----------------------------
loss = model.evaluate(X_test, y_test)
print(f"Test MSE: {loss:.6f}")

# Predict next 10 seconds using last 60 readings
last_sequence = power_scaled[-INPUT_SEQ:].reshape(1, INPUT_SEQ, 1)
pred_scaled = model.predict(last_sequence)
predicted = scaler.inverse_transform(pred_scaled.reshape(-1, 1))

# -----------------------------
# 6. Visualization
# -----------------------------
plt.figure(figsize=(10, 5))
plt.plot(df["power_W"].to_numpy()[-200:], label="Actual (last 200s)")
plt.plot(
    range(len(df) - 1, len(df) + len(predicted) - 1),
    predicted,
    label="Forecast (next 10s)",
    marker="o"
)
plt.legend()
plt.title("Power Consumption Forecast")
plt.xlabel("Time (seconds)")
plt.ylabel("Power (W)")
plt.show()

# -----------------------------
# 7. Save Model
# -----------------------------
model.save("forecast_model.keras")
print("✅ Model trained and saved as 'forecast_model.keras'")
