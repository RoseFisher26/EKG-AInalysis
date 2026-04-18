import { GoogleGenAI, Type } from "@google/genai";
import { EKGAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeEKG(base64Image: string): Promise<EKGAnalysis> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `You are a Senior Healthcare AI Architect and Cardiologist. 
  Analyze this EKG (ECG) image and provide a structured clinical interpretation.
  
  Guidelines:
  1. Assess technical quality (e.g., noise, lead placement).
  2. Measure heart rate and identify rhythm (e.g., Sinus Rhythm, AFib).
  3. Estimate Axis and key intervals (PR, QRS, QT/QTc).
  4. Look for ST segment abnormalities and T wave changes.
  5. Identify potential MI patterns, BBBS, or hypertrophy.
  6. Provide differential diagnoses and urgency level.
  
  Disclaimer: Always state this is a preliminary analysis and not a definitive diagnosis.
  
  Strictly follow the provided JSON schema.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1] || base64Image,
          },
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          technicalQuality: { type: Type.STRING },
          heartRate: { type: Type.NUMBER },
          rhythm: { type: Type.STRING },
          axis: { type: Type.STRING },
          intervals: {
            type: Type.OBJECT,
            properties: {
              pr: { type: Type.STRING },
              qrs: { type: Type.STRING },
              qt: { type: Type.STRING },
              qtc: { type: Type.STRING },
            },
            required: ["pr", "qrs", "qt", "qtc"],
          },
          stSegment: { type: Type.STRING },
          tWave: { type: Type.STRING },
          abnormalities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          preliminaryDiagnosis: { type: Type.STRING },
          differentialDiagnoses: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          urgency: { 
            type: Type.STRING,
            description: "low, moderate, or high"
          },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          confidenceLevel: { type: Type.NUMBER },
        },
        required: [
          "technicalQuality", "heartRate", "rhythm", "axis", "intervals", 
          "stSegment", "tWave", "abnormalities", "preliminaryDiagnosis", 
          "differentialDiagnoses", "urgency", "recommendations", "confidenceLevel"
        ],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as EKGAnalysis;
}
