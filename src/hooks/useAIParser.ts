import { useState } from "react";

export function useAIParser() {
  const [isParsing, setIsParsing] = useState(false);

  async function parse(text: string) {
    setIsParsing(true);
    try {
      const response = await fetch("/api/ai/parse-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      return await response.json();
    } finally {
      setIsParsing(false);
    }
  }

  return { isParsing, parse };
}
