import pandas as pd

df = pd.read_csv("python/data/synthetic_power_data.csv")

print(df.head())
print(df.shape)
print("DataSet Summary: ", df.describe())