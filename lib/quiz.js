export const QUESTION_TYPES = Object.freeze({
  SINGLE_CHOICE: "SINGLE_CHOICE",
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  TRUE_FALSE: "TRUE_FALSE",
});

const normalizeIds = (value) =>
  Array.isArray(value) ? [...new Set(value.map(String))].sort() : [];

export const scoreQuiz = (questions, answersByQuestionId) => {
  let earned = 0;
  let available = 0;

  for (const question of questions) {
    const points = Number(question.points || 0);
    available += points;
    const correctIds = normalizeIds(
      question.options.filter((option) => option.isCorrect).map((option) => option.id)
    );
    const selectedIds = normalizeIds(answersByQuestionId?.[question.id]);
    const correct =
      correctIds.length === selectedIds.length &&
      correctIds.every((id, index) => id === selectedIds[index]);

    if (correct) earned += points;
  }

  const score = available === 0 ? 0 : (earned / available) * 100;
  return { earned, available, score };
};

export const validatePassingScore = (value) => {
  const score = Number(value);
  return Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : 70;
};
