"use client";

import React from "react";
import { Video } from "lucide-react";

interface VideoPlaceholderProps {
  message?: string;
  subMessage?: string;
  showIcon?: boolean;
  className?: string;
}

export function VideoPlaceholder({
  message = "Video stream unavailable",
  subMessage = "Camera access may be blocked or the connection was interrupted",
  showIcon = true,
  className = "",
}: VideoPlaceholderProps) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center bg-gray-900 p-6 text-center text-white ${className}`}
    >
      {showIcon && <Video className="mb-4 h-16 w-16 opacity-50" />}
      <h3 className="mb-2 text-xl font-medium">{message}</h3>
      {subMessage && (
        <p className="mb-4 max-w-md text-sm opacity-75">{subMessage}</p>
      )}
    </div>
  );
}
