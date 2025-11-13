import numpy as np
import pandas as pd
import random
from datetime import datetime, timedelta

# -----------------------------
# CONFIGURATION
# -----------------------------
duration_seconds = 3600   # total seconds (1 hour of data)
switch_interval_range = (10, 120)  # random switching every 10–120 seconds
noise_level = 0.15         # small random fluctuation in readings

# Appliances and their rated power (watts)
appliances = {
    "LED Bulb": 9,
    "Charger": 20,
    "Fan": 60,
    "Laptop": 65,
    "TV": 120,
    "Heater": 1000,
    "Off": 0
}

# -----------------------------
# DATA GENERATION
# -----------------------------
def generate_power_data(duration_seconds, switch_interval_range):
    time_values = []
    power_values = []

    current_time = datetime.now()
    active_device = random.choice(list(appliances.keys()))
    next_switch = random.randint(*switch_interval_range)

    for t in range(duration_seconds):
        # Every few seconds, switch device randomly
        if t % next_switch == 0:
            active_device = random.choice(list(appliances.keys()))
            next_switch = random.randint(*switch_interval_range)
        
        # simulate load + small random noise
        base_power = appliances[active_device]
        noisy_power = max(base_power + np.random.normal(0, noise_level * base_power), 0)

        time_values.append(current_time + timedelta(seconds=t))
        power_values.append(round(noisy_power, 2))

    df = pd.DataFrame({
        "timestamp": time_values,
        "power_W": power_values
    })
    return df

# -----------------------------
# GENERATE AND SAVE
# -----------------------------
print("Generating realistic synthetic power dataset...")

df = generate_power_data(duration_seconds, switch_interval_range)
df.to_csv("synthetic_power_data.csv", index=False)

print("✅ Dataset saved as 'synthetic_power_data.csv'")
print(df.head(15))
