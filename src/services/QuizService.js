// Chiave localStorage per le statistiche quiz
const LS_KEY = 'omnidex_quiz_state';

export function loadQuizState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveQuizState(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {}
}

export function getQuizStats() {
  const s = loadQuizState();
  return s?.stats || { correct: 0, total: 0 };
}
