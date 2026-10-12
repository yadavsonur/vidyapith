"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Check, Trash2, Plus, Sparkles, CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const blank = () => ({
  text: "",
  type: "SINGLE_CHOICE",
  points: 1,
  options: ["", "", "", ""],
  correct: [0],
});

export const QuizBuilder = ({ courseId, initialQuiz }) => {
  const [quiz, setQuiz] = useState(initialQuiz);
  const [form, setForm] = useState(blank());
  const [saving, setSaving] = useState(false);

  const updateQuiz = async (field, value) => {
    const next = { ...quiz, [field]: value };
    setQuiz(next);
    try {
      await axios.patch(`/api/courses/${courseId}/quizzes/${quiz.id}`, {
        [field]: value,
      });
      toast.success("Assessment settings saved");
    } catch (error) {
      toast.error(error?.response?.data || "Unable to update assessment");
    }
  };

  const addQuestion = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const options = form.options
        .map((text, i) => ({ text, isCorrect: form.correct.includes(i) }))
        .filter((x) => x.text.trim());
      const { data } = await axios.post(
        `/api/courses/${courseId}/quizzes/${quiz.id}/questions`,
        {
          text: form.text,
          type: form.type,
          points: form.points,
          options,
        }
      );
      setQuiz((current) => ({
        ...current,
        questions: [...current.questions, data],
      }));
      setForm(blank());
      toast.success("Question appended");
    } catch (error) {
      toast.error(error?.response?.data || "Unable to add question");
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (id) => {
    try {
      await axios.delete(
        `/api/courses/${courseId}/quizzes/${quiz.id}/questions/${id}`
      );
      setQuiz((current) => ({
        ...current,
        questions: current.questions.filter((q) => q.id !== id),
      }));
      toast.success("Question deleted");
    } catch (error) {
      toast.error(error?.response?.data || "Unable to delete question");
    }
  };

  return (
    <div className="space-y-8">
      {/* Quiz Header */}
      <div className="pb-4 border-b border-ink-200/80">
        <div className="text-[10px] font-mono uppercase tracking-widest text-ochre-700 font-semibold mb-1">
          Assessment Designer
        </div>
        <h1 className="font-serif text-3xl font-medium text-ink-950">
          {quiz.title}
        </h1>
        <p className="text-xs text-ink-500 mt-1 font-sans">
          Configure passing requirements, publish status, and construct exam question banks.
        </p>
      </div>

      {/* Global Configuration Grid */}
      <div className="border border-ink-200/90 rounded-lg p-5 bg-white shadow-subtle grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-[10px] font-mono text-ink-400 uppercase block mb-1">
            Exam Title
          </label>
          <input
            className="w-full border border-ink-200 rounded-md px-3 py-1.5 text-xs bg-white text-ink-900 focus:outline-none focus:border-ink-800"
            value={quiz.title}
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            onBlur={() => updateQuiz("title", quiz.title)}
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-ink-400 uppercase block mb-1">
            Passing Score (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            className="w-full border border-ink-200 rounded-md px-3 py-1.5 text-xs font-mono bg-white text-ink-900 focus:outline-none focus:border-ink-800"
            value={quiz.passingScore}
            onChange={(e) =>
              setQuiz({ ...quiz, passingScore: Number(e.target.value) })
            }
            onBlur={() => updateQuiz("passingScore", quiz.passingScore)}
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-ink-400 uppercase block mb-1">
            Maximum Retries
          </label>
          <input
            type="number"
            min="1"
            max="20"
            className="w-full border border-ink-200 rounded-md px-3 py-1.5 text-xs font-mono bg-white text-ink-900 focus:outline-none focus:border-ink-800"
            value={quiz.maxAttempts}
            onChange={(e) =>
              setQuiz({ ...quiz, maxAttempts: Number(e.target.value) })
            }
            onBlur={() => updateQuiz("maxAttempts", quiz.maxAttempts)}
          />
        </div>

        <div className="flex items-end pb-1.5">
          <label className="flex items-center gap-2 text-xs font-mono text-ink-800 cursor-pointer">
            <Checkbox
              checked={quiz.isPublished}
              onCheckedChange={(checked) =>
                updateQuiz("isPublished", !!checked)
              }
            />
            <span>Publish Examination</span>
          </label>
        </div>
        <div className="flex items-end pb-1.5">
          <label className="flex items-center gap-2 text-xs font-mono text-ink-800 cursor-pointer">
            <Checkbox checked={!!quiz.requiredForCompletion} onCheckedChange={(checked)=>updateQuiz("requiredForCompletion", !!checked)} />
            <span>Required for course completion</span>
          </label>
        </div>
      </div>

      {/* Add Question Card */}
      <form
        onSubmit={addQuestion}
        className="border border-ink-200/90 rounded-lg p-5 bg-white shadow-subtle space-y-4"
      >
        <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
          <Sparkles className="h-4 w-4 text-ochre-600" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-ink-600 font-medium">
            Draft New Assessment Question
          </h2>
        </div>

        <textarea
          className="w-full border border-ink-200 rounded-md px-3 py-2 text-xs bg-white text-ink-900 min-h-[70px] focus:outline-none focus:border-ink-800"
          placeholder="State the academic question or problem prompt..."
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-mono text-ink-400 uppercase block mb-1">
              Response Model
            </label>
            <select
              className="w-full border border-ink-200 rounded-md px-2.5 py-1.5 text-xs bg-white text-ink-800 focus:outline-none focus:border-ink-800"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="SINGLE_CHOICE">Single choice</option>
              <option value="MULTIPLE_CHOICE">Multiple choice</option>
              <option value="TRUE_FALSE">True / False</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-ink-400 uppercase block mb-1">
              Point Weight
            </label>
            <input
              type="number"
              min="1"
              className="w-full border border-ink-200 rounded-md px-3 py-1.5 text-xs font-mono bg-white text-ink-900 focus:outline-none focus:border-ink-800"
              value={form.points}
              onChange={(e) =>
                setForm({ ...form, points: Number(e.target.value) })
              }
            />
          </div>

          <div className="flex items-end pb-1 text-xs text-ink-500 font-mono">
            Check the radio / box for correct solution(s).
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-ink-100">
          {form.options.map((option, i) => (
            <div key={i} className="flex gap-2.5 items-center">
              <span className="font-mono text-xs text-ink-400 w-5">
                {String.fromCharCode(65 + i)}.
              </span>
              <input
                className="flex-1 border border-ink-200 rounded-md px-3 py-1.5 text-xs bg-white text-ink-900 focus:outline-none focus:border-ink-800"
                placeholder={`Option ${i + 1} text`}
                value={option}
                onChange={(e) => {
                  const options = [...form.options];
                  options[i] = e.target.value;
                  setForm({ ...form, options });
                }}
              />
              <input
                type={form.type === "MULTIPLE_CHOICE" ? "checkbox" : "radio"}
                name="correct-option"
                checked={form.correct.includes(i)}
                className="h-4 w-4"
                onChange={() =>
                  setForm({
                    ...form,
                    correct:
                      form.type === "MULTIPLE_CHOICE"
                        ? form.correct.includes(i)
                          ? form.correct.filter((v) => v !== i)
                          : [...form.correct, i]
                        : [i],
                  })
                }
              />
            </div>
          ))}
        </div>

        <div className="pt-2">
          <Button
            size="sm"
            disabled={saving || !form.text.trim()}
            className="bg-ink-900 text-parchment-50"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {saving ? "Compiling..." : "Append Question"}
          </Button>
        </div>
      </form>

      {/* Existing Questions Bank */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-ink-500 px-1">
          Active Examination Bank ({quiz.questions?.length || 0})
        </div>

        {quiz.questions?.map((question, index) => (
          <div
            key={question.id}
            className="border border-ink-200/90 rounded-lg p-5 bg-white shadow-subtle space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-serif font-medium text-base text-ink-950">
                  <span className="font-mono text-xs text-ink-400 mr-2">
                    Q{index + 1}.
                  </span>
                  {question.text}
                </div>
                <div className="text-[11px] font-mono text-ink-500 mt-1">
                  Model: {question.type} · Weight: {question.points} pt
                  {question.points === 1 ? "" : "s"}
                </div>
              </div>
              <button
                type="button"
                className="text-ink-400 hover:text-vermilion-600 transition p-1"
                onClick={() => deleteQuestion(question.id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-ink-100">
              {question.options.map((option, optIdx) => (
                <div
                  key={option.id}
                  className={`p-2.5 rounded-md text-xs border flex items-center justify-between ${
                    option.isCorrect
                      ? "bg-sage-50 border-sage-300 text-sage-900 font-medium"
                      : "bg-parchment-25 border-ink-200 text-ink-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-ink-400 text-[10px]">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>
                    {option.text}
                  </span>
                  {option.isCorrect && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-sage-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
