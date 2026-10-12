"use client";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Star, MessageSquare } from "lucide-react";

export const CourseReviewForm = ({ courseId, existingReview }) => {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [review, setReview] = useState(existingReview?.review || "");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await axios({
        method: existingReview ? "patch" : "post",
        url: `/api/courses/${courseId}/reviews`,
        data: { rating, review },
      });
      toast.success(
        existingReview ? "Course evaluation updated" : "Critique submitted"
      );
      window.location.reload();
    } catch (error) {
      toast.error(error?.response?.data || "Unable to save review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="border border-ink-200/90 rounded-xl p-6 bg-white shadow-subtle space-y-4"
    >
      <div className="flex items-center justify-between pb-3 border-b border-ink-100">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-ochre-700 font-semibold">
            Scholar Evaluation
          </div>
          <h3 className="font-serif font-medium text-lg text-ink-950 mt-0.5">
            {existingReview ? "Modify Your Evaluation" : "Submit Peer Critique"}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} stars`}
              className={`text-xl transition-transform hover:scale-110 ${
                value <= rating ? "text-ochre-500" : "text-ink-200"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Share your perspective on the depth, lecture clarity, and syllabus rigor..."
        className="w-full border border-ink-200 rounded-md p-3 text-xs md:text-sm bg-white text-ink-900 min-h-[90px] focus:outline-none focus:border-ink-800 font-sans"
      />

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] font-mono text-ink-400">
          Evaluations are reviewed before publication to the course catalog.
        </span>
        <Button
          size="sm"
          disabled={saving}
          className="bg-ink-900 text-parchment-50 hover:bg-ink-800"
        >
          {saving ? "Filing..." : existingReview ? "Update Review" : "Submit Review"}
        </Button>
      </div>
    </form>
  );
};
