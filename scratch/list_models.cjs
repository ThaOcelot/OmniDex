const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyAMtHbhzi516qGxbi7iPtqlWcv-1WKFrhM';

async function listModels() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await response.json();
  console.log(data);
}

listModels();
