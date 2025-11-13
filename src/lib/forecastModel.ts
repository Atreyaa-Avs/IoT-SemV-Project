import * as tf from "@tensorflow/tfjs";

let model: tf.LayersModel | null = null;

export async function loadForecastModel() {
  if (!model) {
    model = await tf.loadLayersModel("/models/forecast_model/model.json");
    console.log("✅ Forecast model loaded!");
  }
  return model;
}

export async function forecastNextSteps(
  data: number[],
  inputSeq = 60,
  outputSeq = 10,
  stepsAhead = 100
) {
  if (!model) throw new Error("Model not loaded yet!");

  const min = Math.min(...data);
  const max = Math.max(...data);
  const scaled = data.map((v) => (v - min) / (max - min));

  let input = scaled.slice(-inputSeq);
  let predictions: number[] = [];

  for (let i = 0; i < stepsAhead / outputSeq; i++) {
    const inputTensor = tf.tensor(input).reshape([1, inputSeq, 1]);
    const predScaled = model.predict(inputTensor) as tf.Tensor;
    const predArray = Array.from(await predScaled.data());
    predictions.push(...predArray);
    input = input.slice(outputSeq).concat(predArray);
  }

  // Inverse scale
  const invScaled = predictions.map((v) => v * (max - min) + min);
  return invScaled.slice(0, stepsAhead);
}
