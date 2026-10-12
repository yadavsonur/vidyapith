"use client";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Sparkles, ArrowRight } from "lucide-react";

export const CourseEnrollButton = ({ price, courseId, enrolled = false }) => {
  const { isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    if (!isSignedIn) {
      window.location.assign(
        `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
    try {
      setIsLoading(true);
      if (Number(price || 0) <= 0) {
        await axios.post(`/api/courses/${courseId}/enroll`);
        window.location.reload();
        return;
      }
      const response = await axios.post(`/api/courses/${courseId}/checkout`);
      window.location.assign(response.data.url);
    } catch (error) {
      toast.error(error?.response?.data || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const isFree = Number(price || 0) <= 0;

  return (
    <Button
      onClick={onClick}
      disabled={isLoading || enrolled}
      size="default"
      className="w-full md:w-auto bg-ink-950 text-parchment-50 hover:bg-ink-800 font-medium tracking-tight shadow-sm"
    >
      {isFree ? (
        <>
          <Sparkles className="h-3.5 w-3.5 mr-1.5 text-ochre-400" />
          {enrolled ? "Already Enrolled" : "Enroll with Free Access"}
        </>
      ) : (
        <>
          <span>{enrolled ? "Enrolled" : `Enroll for ${formatPrice(price)}`}</span>
          <ArrowRight className="h-3.5 w-3.5 ml-2" />
        </>
      )}
    </Button>
  );
};
