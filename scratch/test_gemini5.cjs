const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyAMtHbhzi516qGxbi7iPtqlWcv-1WKFrhM';
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const result = await model.generateContent('Ciao');
    console.log('Success 2.5-pro:', result.response.text());
  } catch (e) {
    console.error('Error 2.5-pro:', e.message);
  }
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent('Ciao');
    console.log('Success 1.5-pro:', result.response.text());
  } catch (e) {
    console.error('Error 1.5-pro:', e.message);
  }
}

test();
