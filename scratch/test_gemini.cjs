const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyD1sEiPk5JBY806nZhJJEna-GNPA0TMUiM';
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Ciao');
    console.log('Success:', result.response.text());
  } catch (e) {
    console.error('Error 2.5-flash:', e.message);
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Ciao');
    console.log('Success 1.5-flash:', result.response.text());
  } catch (e) {
    console.error('Error 1.5-flash:', e.message);
  }
}

test();
