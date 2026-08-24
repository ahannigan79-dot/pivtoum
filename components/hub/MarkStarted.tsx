"use client";
import { useEffect, useRef } from "react";
import { markLearnStarted } from "@/app/hub/actions";

/** Fires once on mount to record that the member has genuinely opened Learn. */
export function MarkStarted() {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void markLearnStarted();
  }, []);
  return null;
}
