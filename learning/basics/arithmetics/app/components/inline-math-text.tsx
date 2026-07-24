"use client";

import MathFormula from "./math-formula";

export default function InlineMathText({ text }: { text: string }) {
  return text.split(/(\$[^$]+\$)/g).map((part, index) => {
    if (part.startsWith("$") && part.endsWith("$")) {
      return <MathFormula key={`${part}-${index}`} latex={part.slice(1, -1)} />;
    }
    return part;
  });
}
