"use client";

import katex from "katex";

type MathFormulaProps = {
  latex: string;
  display?: boolean;
  className?: string;
};

export default function MathFormula({ latex, display = false, className = "" }: MathFormulaProps) {
  const html = katex.renderToString(latex, {
    displayMode: display,
    throwOnError: false,
    strict: "warn",
    trust: false,
    output: "htmlAndMathml",
  });

  return (
    <span
      className={`math-formula${display ? " math-formula-display" : ""}${className ? ` ${className}` : ""}`}
      data-math-latex={latex}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
