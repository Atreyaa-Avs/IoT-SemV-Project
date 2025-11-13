import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from tensorflow import keras
from sklearn.preprocessing import MinMaxScaler

# -----------------------------
# 1. Load Model and Data
# -----------------------------
model = keras.models.load_model(r"C:\IoT-Proj\python\forecast_model.keras")
print("✅ Model loaded successfully!")

# Load the same dataset you trained on
df = pd.read_csv("python/data/synthetic_power_data.csv")
power = df["power_W"].to_numpy().reshape(-1, 1)

# Normalize again (same scaling as training)
scaler = MinMaxScaler()
power_scaled = scaler.fit_transform(power)

# -----------------------------
# 2. Configuration
# -----------------------------
INPUT_SEQ = 60   # last 60 seconds as input
OUTPUT_SEQ = 10  # predict next 10 seconds

# -----------------------------
# 3. Forecasting Function
# -----------------------------
def forecast_next_steps(model, data_scaled, input_seq=60, output_seq=10, steps_ahead=100):
    """
    Performs rolling forecasting using the trained model.
    Each prediction is fed back as new input for continuous forecasting.
    """
    input_seq_data = data_scaled[-input_seq:].reshape(1, input_seq, 1)
    predictions = []

    for _ in range(steps_ahead // output_seq):
        pred_scaled = model.predict(input_seq_data, verbose=0)
        predictions.extend(pred_scaled.flatten())

        # Append predicted values to the input for next iteration
        input_seq_data = np.append(input_seq_data[:, output_seq:, :], 
                                   pred_scaled.reshape(1, output_seq, 1), axis=1)

    predictions = np.array(predictions[:steps_ahead]).reshape(-1, 1)
    return scaler.inverse_transform(predictions)

# -----------------------------
# 4. Generate Forecast
# -----------------------------
forecast_horizon = 100  # predict next 100 seconds
predicted_values = forecast_next_steps(model, power_scaled, INPUT_SEQ, OUTPUT_SEQ, forecast_horizon)

# -----------------------------
# 5. Prepare Data for Plotting
# -----------------------------
# Take the last 300 seconds of actual data
actual_data = power[-300:]

# Forecast continuation (next 100 points)
forecast = predicted_values.flatten()

# -----------------------------
# 6. Plot Actual vs Forecast
# -----------------------------
plt.figure(figsize=(12,6))
plt.plot(range(len(actual_data)), actual_data, label='Actual (last 300 sec)', color='blue')
plt.plot(range(len(actual_data), len(actual_data) + forecast_horizon),
         forecast, label='Forecast (next 100 sec)', color='orange', marker='o')

plt.title('⚡ Power Consumption Forecast (LSTM)')
plt.xlabel('Time (seconds)')
plt.ylabel('Power (W)')
plt.legend()
plt.grid(True)
plt.show()

print(f"✅ Forecast complete. Predicted next {forecast_horizon} seconds of power usage.")
