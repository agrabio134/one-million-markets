"use client";
import { useState } from "react";
import { Terminal, type Mode } from "@/components/trade/Terminal";

export function LiveExperience() {
  const [mode, setMode] = useState<Mode>("spot");
  return <Terminal mode={mode} embedded onModeChange={setMode} />;
}
