"use client";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, RotateCcw, Award } from "lucide-react";

export const QuizPlayer = ({ courseId, quiz, attemptsUsed }) => {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const setAnswer = (question, optionId) =>
    setAnswers((current) => {
      const currentIds = current[question.id] || [];
      if (question.type === "MULTIPLE_CHOICE") {
        return {
          ...current,
          [question.id]: currentIds.includes(optionId)
            ? currentIds.filter((id) => id !== optionId)
            : [...currentIds, optionId],
        };
      }
      return { ...current, [question.id]: [optionId] };
    });

  const submit = async () => {
    setSaving(true);
    try {
      const { data } = await axios.post(
        `/api/courses/${courseId}/quizzes/${quiz.id}/attempts`,
        { answers }
      );
      setResult(data);
    } catch (error) {
      toast.error(error?.response?.data || "Unable to submit examination");
    } finally {
      setSaving(false);
    }
  };

  if (result) {
    const isPassed = result.passed;
    return (
      <div className="border border-ink-200/90 rounded-2xl p-10 bg-white shadow-card text-center max-w-xl mx-auto space-y-4">
        <div
          className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center border ${
            isPassed
              ? "bg-sage-50 border-sage-300 text-sage-600"
              : "bg-vermilion-50 border-vermilion-200 text-vermilion-600"
          }`}
        >
          {isPassed ? (
            <Award className="h-8 w-8" />
          ) : (
            <XCircle className="h-8 w-8" />
          )}
        </div>

        <div className="font-serif text-5xl font-bold text-ink-950">
          {Math.round(result.score)}%
        </div>

        <div>
          <h2 className="font-serif text-2xl font-medium text-ink-950">
            {isPassed ? "Examination Passed with Merit" : "Examination Standard Not Met"}
          </h2>
          <p className="text-xs text-ink-500 font-mono mt-1">
            Passing benchmark: {result.passingScore}% · Attempt {result.attemptsUsed}
          </p>
        </div>

        {!result.passed && result.attemptsRemaining > 0 && (
          <div className="pt-4">
            <Button
              className="bg-ink-900 text-parchment-50 hover:bg-ink-800"
              onClick={() => window.location.reload()}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-2" />
              Retake Examination ({result.attemptsRemaining} remaining)
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="pb-4 border-b border-ink-200/80">
        <div className="text-[10px] font-mono uppercase tracking-widest text-ochre-700 font-semibold mb-1">
          Formal Assessment
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-ink-950">
          {quiz.title}
        </h1>
        <div className="flex items-center gap-2 text-xs font-mono text-ink-500 mt-2">
          <span>Passing Mark: {quiz.passingScore}%</span>
          <span>·</span>
          <span>
            Attempts: {attemptsUsed} of {quiz.maxAttempts} utilized
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, index) => (
          <div
            key={question.id}
            className="border border-ink-200/90 rounded-xl p-6 bg-white shadow-subtle space-y-4"
          >
            <div className="font-serif font-medium text-lg text-ink-950 leading-snug">
              <span className="font-mono text-xs text-ink-400 mr-2">
                Q{index + 1}.
              </span>
              {question.text}
            </div>

            <div className="space-y-2.5">
              {question.options.map((option, optIdx) => {
                const selected = (answers[question.id] || []).includes(option.id);
                return (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3.5 border rounded-lg p-3.5 cursor-pointer text-xs md:text-sm font-sans transition-all ${
                      selected
                        ? "border-ink-900 bg-parchment-100/90 font-medium text-ink-950 shadow-subtle"
                        : "border-ink-200/90 bg-white hover:bg-parchment-50/70 text-ink-800"
                    }`}
                  >
                    <input
                      type={question.type === "MULTIPLE_CHOICE" ? "checkbox" : "radio"}
                      name={`q-${question.id}`}
                      checked={selected}
                      className="h-4 w-4 text-ink-900 focus:ring-ochre-500"
                      onChange={() => setAnswer(question, option.id)}
                    />
                    <span className="font-mono text-xs text-ink-400">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>
                    <span className="flex-1">{option.text}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 flex items-center justify-between">
        <span className="text-xs font-mono text-ink-500">
          Answers will be evaluated immediately against rubric keys.
        </span>
        <Button
          onClick={submit}
          disabled={saving || quiz.questions.length === 0}
          size="lg"
          className="bg-ink-900 text-parchment-50 hover:bg-ink-800 font-medium"
        >
          {saving ? "Evaluating Answers..." : "Submit Examination for Grading"}
        </Button>
      </div>
    </div>
  );
};
