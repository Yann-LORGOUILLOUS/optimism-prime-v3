"use client";

import { useState, useEffect } from "react";
import { TimeFormatter } from "../../../domain/reliquary/services/TimeFormatter";

interface MaturityTimerProps {
  initialSeconds: number;
  increment: number;
  useShortFormat?: boolean;
}

export function MaturityTimer({
  initialSeconds,
  increment,
  useShortFormat = false,
}: MaturityTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((current) => current + increment);
    }, 1000);

    return () => clearInterval(interval);
  }, [increment]);

  const displayValue = Math.max(Math.round(seconds), 0);
  const formatted = useShortFormat
    ? TimeFormatter.toShortFormat(displayValue)
    : TimeFormatter.toLongFormat(displayValue);

  return <span>{formatted}</span>;
}