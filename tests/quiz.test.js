import test from "node:test";
import assert from "node:assert/strict";
import { scoreQuiz } from "../lib/quiz.js";

const questions = [
  { id: "q1", points: 2, options: [{ id: "a", isCorrect: true }, { id: "b", isCorrect: false }] },
  { id: "q2", points: 1, options: [{ id: "c", isCorrect: true }, { id: "d", isCorrect: true }, { id: "e", isCorrect: false }] },
];

test("quiz scoring awards points for exact answers", () => {
  const result = scoreQuiz(questions, { q1: ["a"], q2: ["c", "d"] });
  assert.equal(result.earned, 3);
  assert.equal(result.available, 3);
  assert.equal(result.score, 100);
});

test("quiz scoring rejects partial multiple-choice answers", () => {
  const result = scoreQuiz(questions, { q1: ["a"], q2: ["c"] });
  assert.equal(result.earned, 2);
  assert.ok(Math.abs(result.score - 66.6666667) < 0.0001);
});
