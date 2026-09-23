import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("."));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Test route
app.get("/", (req, res) => {
  res.send("FitBuddy server is running!");
});

// Generate fitness plan
app.post("/api/generate-plan", async (req, res) => {
  try {
    const {
      name,
      age,
      height,
      weight,
      goal,
      activityLevel,
      experience,
      availableTime
    } = req.body;

    const prompt = `
You are FitBuddy, an AI fitness planning assistant.

Create a beginner-friendly weekly fitness plan using the following information:

Name: ${name}
Age: ${age}
Height: ${height}
Weight: ${weight}
Fitness Goal: ${goal}
Activity Level: ${activityLevel}
Fitness Experience: ${experience}
Available Workout Time: ${availableTime}

Provide:
1. Weekly workout schedule
2. Exercises for each day
3. Sets and repetitions where appropriate
4. Rest days
5. General nutrition suggestions
6. Simple fitness tips

Keep the plan practical, clear, and easy for a beginner to understand.
Do not provide medical diagnosis or treatment.
`;

    let response;

for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt
    });

    break;
  } catch (error) {
    if (attempt === 3) {
      throw error;
    }

    console.log(`Gemini attempt ${attempt} failed. Retrying...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

    res.json({
      success: true,
      plan: response.text
    });

  } catch (error) {
    console.error("Gemini Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to generate fitness plan.",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`FitBuddy server running at http://localhost:${PORT}`);
});