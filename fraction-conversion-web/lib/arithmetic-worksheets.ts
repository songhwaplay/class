export type ArithmeticWorksheet = {
  name: string;
  route: string | null;
};

const readyRoutes: Record<string, string> = {
  "1수세기①": "/arithmetic/counting-1",
  "1덧셈뺄셈①": "/arithmetic/add-subtract-1",
  "1덧셈뺄셈②": "/arithmetic/add-subtract-2",
  "1주고받기": "/arithmetic/give-and-take-1",
  "1보수": "/arithmetic/complements-1",
  "1덧셈뺄셈③": "/arithmetic/add-subtract-3",
  "1덧셈뺄셈④": "/arithmetic/add-subtract-4",
  "1수읽기": "/arithmetic/number-reading-1",
  "1뛰어세기": "/arithmetic/skip-counting-1",
  "2덧셈뺄셈①": "/arithmetic/grade-2-add-subtract-1",
  "2덧셈뺄셈②": "/arithmetic/grade-2-add-subtract-2",
  "2덧셈뺄셈③": "/arithmetic/grade-2-add-subtract-3",
  "2묶어세기": "/arithmetic/group-counting-1",
  "2길이재기": "/arithmetic/length-measuring-1",
  "2구구단①": "/arithmetic/multiplication-1",
  "2구구단②": "/arithmetic/multiplication-2",
  "2구구단③": "/arithmetic/multiplication-3",
  "2구구단④": "/arithmetic/multiplication-4",
  "2구구단⑤": "/arithmetic/multiplication-5",
  "2시계": "/arithmetic/clock-1",
  "3덧셈뺄셈": "/arithmetic/grade-3-add-subtract",
  "3덧셈뺄셈빈칸": "/arithmetic/grade-3-add-subtract-blanks",
  "3보수뺄셈100": "/arithmetic/grade-3-complement-subtraction-100",
  "3분수②": "/fraction",
};

const worksheetNames = [
  "1수세기①", "1덧셈뺄셈①", "1덧셈뺄셈②", "1주고받기", "1보수", "1덧셈뺄셈③", "1덧셈뺄셈④", "1수읽기", "1뛰어세기",
  "2덧셈뺄셈①", "2덧셈뺄셈②", "2덧셈뺄셈③", "2묶어세기", "2길이재기", "2구구단①", "2구구단②", "2구구단③", "2구구단④", "2구구단⑤", "2시계",
  "3덧셈뺄셈", "3덧셈뺄셈빈칸", "3보수뺄셈100", "3보수뺄셈1000", "3덧셈뺄셈②", "3나눗셈①", "3곱셈①", "3곱셈②", "3길이", "3시간①", "3시간②", "3곱셈③", "19단", "제곱수", "3나눗셈②", "3나눗셈③", "3분수①", "3분수②", "3무게,들이", "3분수③",
  "4숫자읽기", "4곱셈", "4큰수곱셈", "4나눗셈", "4분수", "4소수", "단위변환",
  "5혼합계산", "자연수분해", "프라임넘버", "5약수,배수", "5분수①", "5분수②", "5분수③", "5소수",
  "6분수", "6소수①", "6소수②", "6소수③", "6혼합계산", "6비례식", "6원", "6원기둥",
] as const;

export const arithmeticWorksheetCatalog: ArithmeticWorksheet[] = worksheetNames.map((name) => ({
  name,
  route: readyRoutes[name] ?? null,
}));

export const raceReadyWorksheets = arithmeticWorksheetCatalog.filter(
  (worksheet): worksheet is { name: string; route: string } => Boolean(worksheet.route?.startsWith("/arithmetic/")),
);

export function raceWorksheetByRoute(route: string) {
  return raceReadyWorksheets.find((worksheet) => worksheet.route === route) ?? null;
}
