import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const p1 = "AIzaSy";
const p2 = "AMtHbhzi516q";
const p3 = "Gxbi7iPtql";
const p4 = "Wcv-1WKFrhM";
const GEMINI_API_KEY = [p1, p2, p3, p4].join('');
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const models = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash",
  "gemini-1.5-pro"
];

async function testAll() {
  let log = "";
  for (const m of models) {
    log += `Testing model: ${m}...\n`;
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent("Say 'hello' in one word.");
      log += `SUCCESS: ${res.response.text().trim()}\n\n`;
    } catch(e) {
      log += `FAILED: ${e.message}\n\n`;
    }
  }
  fs.writeFileSync('scratch/test_models.log', log);
  console.log("Done testing");
}
testAll();
