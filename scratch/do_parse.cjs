const fs = require('fs');
let content = fs.readFileSync('scratch/parse_quizzes.cjs', 'utf8');

// I will extract the raw string from the previous file
const rawString = content.split('const raw = `')[1].split('`;')[0];

const lines = rawString.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const quizzes = [];
let currentQuiz = null;

for (let line of lines) {
  // Ignoriamo i titoli delle sezioni (non iniziano con numero o lettera)
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

fs.writeFileSync('src/data/quizzes.json', JSON.stringify(quizzes, null, 2));
console.log('Quizzes saved: ' + quizzes.length);
