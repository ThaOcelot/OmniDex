const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyAMtHbhzi516qGxbi7iPtqlWcv-1WKFrhM';
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Ciao');
    console.log('Success gemini-pro:', result.response.text());
  } catch (e) {
    console.error('Error gemini-pro:', e.message);
  }
}

test();
