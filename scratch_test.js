import fs from 'fs';

async function test() {
  const envFile = fs.readFileSync('.env', 'utf8');
  const key = envFile.split('\n').find(l => l.startsWith('VITE_GEMINI_API_KEY')).split('=')[1].trim();

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    console.log("Full data:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("ERROR listing models:", e.message);
  }
}
test();
