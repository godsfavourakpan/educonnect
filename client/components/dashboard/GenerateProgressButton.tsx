"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";
import { toast } from "sonner";

export function GenerateProgressButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateProgress = async () => {
    setIsLoading(true);

    try {
      const response = await axios.post("/student/demo-progress");
      toast.success(
        `Generated progress data for ${response.data.count} courses`
      );

      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      console.error("Failed to generate progress data:", error);
      toast.error("Failed to generate progress data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerateProgress}
      disabled={isLoading}
    >
      {isLoading ? "Generating..." : "Generate Test Data"}
    </Button>
  );
}
