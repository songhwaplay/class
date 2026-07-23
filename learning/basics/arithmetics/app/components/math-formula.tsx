"use client";

import katex from "katex";

type MathFormulaProps = {
  latex: string;
  display?: boolean;
  displayStyle?: boolean;
  className?: string;
};

export default function MathFormula({ latex, display = false, displayStyle = false, className = "" }: MathFormulaProps) {
  const renderedLatex = displayStyle ? String.raw`\displaystyle ${latex}` : latex;
  const html = katex.renderToString(renderedLatex, {
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
