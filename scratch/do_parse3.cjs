const fs = require('fs');

const rawString = fs.readFileSync('scratch/raw.txt', 'utf8');
const lines = rawString.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const quizzes = [];
let currentQuiz = null;

for (let line of lines) {
  if (!line.match(/^\d+\./) && !line.match(/^[A-D]\)/)) {
    continue;
  }
  
  if (line.match(/^\d+\./)) {
    if (currentQuiz) quizzes.push(currentQuiz);
    currentQuiz = {
      q: line.replace(/^\d+\.\s*/, ''),
      options: [],
      correct: 0
    };
  } else if (line.match(/^[A-D]\)/) && currentQuiz) {
    let text = line.replace(/^[A-D]\)\s*/, '');
    let isCorrect = text.includes('✅');
    text = text.replace('✅', '').trim();
    currentQuiz.options.push(text);
    if (isCorrect) {
      currentQuiz.correct = currentQuiz.options.length - 1;
    }
  }
}
if (currentQuiz) quizzes.push(currentQuiz);

let existingQuizzes = [];
try {
  existingQuizzes = JSON.parse(fs.readFileSync('src/data/quizzes.json', 'utf8'));
} catch (e) {
  console.error("No existing quizzes found");
}

const allQuizzes = existingQuizzes.concat(quizzes);

fs.writeFileSync('src/data/quizzes.json', JSON.stringify(allQuizzes, null, 2));
console.log('Total quizzes saved: ' + allQuizzes.length);
