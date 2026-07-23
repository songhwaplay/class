import type { GeometryChoiceItem } from "../app/arithmetic/high-school/components/geometry-choice-worksheet";

function choices(answer: string, distractors: string[], id: string) {
  return [answer, ...distractors].map((latex, index) => ({ id: `${id}-${index}`, latex, correct: index === 0 }));
}

function item(id: string, label: string, latex: string, answer: string, distractors: string[]): GeometryChoiceItem {
  return { id, label, latex, correctLatex: answer, choices: choices(answer, distractors, id) };
}

export const conicProblems: GeometryChoiceItem[] = [
  item("c1", "타원의 초점", String.raw`\frac{x^2}{16}+\frac{y^2}{9}=1`, String.raw`(\pm\sqrt7,0)`, [String.raw`(\pm5,0)`, String.raw`(0,\pm\sqrt7)`, String.raw`(\pm7,0)`]),
  item("c2", "쌍곡선의 꼭짓점", String.raw`\frac{x^2}{9}-\frac{y^2}{16}=1`, String.raw`(\pm3,0)`, [String.raw`(0,\pm4)`, String.raw`(\pm5,0)`, String.raw`(\pm4,0)`]),
  item("c3", "포물선의 초점", String.raw`y^2=12x`, String.raw`(3,0)`, [String.raw`(6,0)`, String.raw`(0,3)`, String.raw`(-3,0)`]),
  item("c4", "표준형", String.raw`x^2+4y^2-8x+8y+4=0`, String.raw`\frac{(x-4)^2}{16}+\frac{(y+1)^2}{4}=1`, [String.raw`\frac{(x+4)^2}{16}+\frac{(y-1)^2}{4}=1`, String.raw`\frac{(x-4)^2}{4}+\frac{(y+1)^2}{16}=1`, String.raw`\frac{(x-4)^2}{16}-\frac{(y+1)^2}{4}=1`]),
  item("c5", "타원의 이심률", String.raw`\frac{x^2}{25}+\frac{y^2}{9}=1`, String.raw`\frac45`, [String.raw`\frac35`, String.raw`\frac54`, String.raw`\frac25`]),
  item("c6", "쌍곡선의 점근선", String.raw`\frac{x^2}{16}-\frac{y^2}{9}=1`, String.raw`y=\pm\frac34x`, [String.raw`y=\pm\frac43x`, String.raw`y=\pm\frac75x`, String.raw`y=\pm x`]),
  item("c7", "포물선의 준선", String.raw`x^2=-8y`, String.raw`y=2`, [String.raw`y=-2`, String.raw`x=2`, String.raw`x=-2`]),
];

export const conicMoveTangentProblems: GeometryChoiceItem[] = [
  item("t1", "타원의 평행이동", String.raw`\frac{x^2}{16}+\frac{y^2}{4}=1\ \xrightarrow{(3,-2)}`, String.raw`\frac{(x-3)^2}{16}+\frac{(y+2)^2}{4}=1`, [String.raw`\frac{(x+3)^2}{16}+\frac{(y-2)^2}{4}=1`, String.raw`\frac{(x-3)^2}{4}+\frac{(y+2)^2}{16}=1`, String.raw`\frac{(x+3)^2}{16}+\frac{(y+2)^2}{4}=1`]),
  item("t2", "쌍곡선의 평행이동", String.raw`\frac{x^2}{9}-\frac{y^2}{4}=1\ \xrightarrow{(2,-1)}`, String.raw`\frac{(x-2)^2}{9}-\frac{(y+1)^2}{4}=1`, [String.raw`\frac{(x+2)^2}{9}-\frac{(y-1)^2}{4}=1`, String.raw`\frac{(x-2)^2}{4}-\frac{(y+1)^2}{9}=1`, String.raw`\frac{(x+2)^2}{9}-\frac{(y+1)^2}{4}=1`]),
  item("t3", "타원의 접선", String.raw`\frac{x^2}{9}+\frac{y^2}{4}=1,\quad P(0,2)`, String.raw`y=2`, [String.raw`x=2`, String.raw`y=-2`, String.raw`x=3`]),
  item("t4", "쌍곡선의 접선", String.raw`\frac{x^2}{16}-\frac{y^2}{9}=1,\quad P(4,0)`, String.raw`x=4`, [String.raw`y=4`, String.raw`x=-4`, String.raw`y=3`]),
  item("t5", "포물선의 접선", String.raw`y^2=8x,\quad P(2,4)`, String.raw`y=x+2`, [String.raw`y=2x`, String.raw`y=x-2`, String.raw`y=2x+4`]),
  item("t6", "타원의 접선", String.raw`\frac{x^2}{25}+\frac{y^2}{9}=1,\quad P\left(4,\frac95\right)`, String.raw`\frac{4x}{25}+\frac{y}{5}=1`, [String.raw`\frac{4x}{5}+\frac{y}{25}=1`, String.raw`\frac{x}{4}+\frac{5y}{9}=1`, String.raw`\frac{4x}{25}-\frac{y}{5}=1`]),
  item("t7", "이동한 포물선", String.raw`(y-3)^2=-12(x+1)`, String.raw`\text{초점 }(-4,3)`, [String.raw`\text{초점 }(2,3)`, String.raw`\text{초점 }(-1,0)`, String.raw`\text{초점 }(-1,6)`]),
];

export const planeVectorProblems: GeometryChoiceItem[] = [
  item("v1", "벡터의 합", String.raw`(3,-2)+(-1,5)`, String.raw`(2,3)`, [String.raw`(4,-7)`, String.raw`(2,-3)`, String.raw`(-2,3)`]),
  item("v2", "벡터의 크기", String.raw`\left|(-6,8)\right|`, String.raw`10`, [String.raw`14`, String.raw`\sqrt{28}`, String.raw`100`]),
  item("v3", "실수배와 합", String.raw`2(1,-3)-3(-2,1)`, String.raw`(8,-9)`, [String.raw`(-4,-9)`, String.raw`(8,-3)`, String.raw`(-8,9)`]),
  item("v4", "단위벡터", String.raw`\vec a=(3,4),\quad \frac{\vec a}{|\vec a|}`, String.raw`\left(\frac35,\frac45\right)`, [String.raw`(3,4)`, String.raw`\left(\frac43,\frac34\right)`, String.raw`\left(\frac15,\frac15\right)`]),
  item("v5", "평행 조건", String.raw`(k,6)\parallel(2,3)`, String.raw`k=4`, [String.raw`k=2`, String.raw`k=9`, String.raw`k=-4`]),
  item("v6", "위치벡터", String.raw`\overrightarrow{OA}=(2,-1),\ \overrightarrow{AB}=(-5,4)`, String.raw`\overrightarrow{OB}=(-3,3)`, [String.raw`\overrightarrow{OB}=(7,-5)`, String.raw`\overrightarrow{OB}=(-7,5)`, String.raw`\overrightarrow{OB}=(3,-3)`]),
  item("v7", "내분점의 위치벡터", String.raw`AP:PB=2:1,\quad \vec a=(1,4),\ \vec b=(7,-2)`, String.raw`\vec p=(5,0)`, [String.raw`\vec p=(3,2)`, String.raw`\vec p=(4,1)`, String.raw`\vec p=(2,3)`]),
];

export const projectionProblems: GeometryChoiceItem[] = [
  item("p1", "내적", String.raw`\vec a=(2,3),\quad\vec b=(4,-1),\quad \vec a\cdot\vec b=?`, String.raw`5`, [String.raw`11`, String.raw`8`, String.raw`-5`]),
  item("p2", "수직 조건", String.raw`(k,2)\perp(3,-6)\text{일 때}\quad k=?`, String.raw`k=4`, [String.raw`k=-4`, String.raw`k=2`, String.raw`k=12`]),
  item("p3", "두 벡터가 이루는 각", String.raw`\vec a=(1,0),\quad\vec b=(1,\sqrt3),\quad \theta=?`, String.raw`\frac{\pi}{3}`, [String.raw`\frac{\pi}{6}`, String.raw`\frac{\pi}{4}`, String.raw`\frac{2\pi}{3}`]),
  item("p4", "스칼라 정사영", String.raw`\vec a=(3,4),\ \vec b=(4,0),\quad \frac{\vec a\cdot\vec b}{|\vec b|}=?`, String.raw`3`, [String.raw`4`, String.raw`\frac{12}{5}`, String.raw`12`]),
  item("p5", "벡터 정사영", String.raw`\vec a=(2,3),\ \vec b=(1,1),\quad \vec a_{\parallel}=?`, String.raw`\left(\frac52,\frac52\right)`, [String.raw`(5,5)`, String.raw`\left(1,\frac32\right)`, String.raw`\left(-\frac12,\frac12\right)`]),
  item("p6", "수직 성분", String.raw`\vec a=(5,2),\ \vec b=(1,1),\quad \vec a_{\perp}=?`, String.raw`\left(\frac32,-\frac32\right)`, [String.raw`\left(\frac72,\frac72\right)`, String.raw`(3,-3)`, String.raw`\left(-\frac32,\frac32\right)`]),
  item("p7", "좌표축과 이루는 각", String.raw`\vec a=(3,4),\quad \cos\angle(\vec a,\ x\text{축})=?`, String.raw`\frac35`, [String.raw`\frac45`, String.raw`\frac34`, String.raw`\frac53`]),
];

export const vectorGeometryProblems: GeometryChoiceItem[] = [
  item("g1", "직선의 방향벡터", String.raw`2x-3y+5=0`, String.raw`(3,2)`, [String.raw`(2,-3)`, String.raw`(2,3)`, String.raw`(-3,2)`]),
  item("g2", "법선벡터", String.raw`4x+y-7=0`, String.raw`(4,1)`, [String.raw`(1,4)`, String.raw`(1,-4)`, String.raw`(4,-1)`]),
  item("g3", "벡터로 나타낸 직선", String.raw`P(1,-2),\quad \vec d=(3,1)`, String.raw`(x,y)=(1,-2)+t(3,1)`, [String.raw`(x,y)=(3,1)+t(1,-2)`, String.raw`(x,y)=(1,2)+t(3,-1)`, String.raw`(x,y)=t(4,-1)`]),
  item("g4", "점과 직선 사이의 거리", String.raw`P(2,-1),\quad 3x+4y-10=0`, String.raw`\frac85`, [String.raw`\frac45`, String.raw`2`, String.raw`8`]),
  item("g5", "삼각형의 넓이", String.raw`\overrightarrow{AB}=(4,1),\quad\overrightarrow{AC}=(2,5)`, String.raw`9`, [String.raw`18`, String.raw`11`, String.raw`\frac92`]),
  item("g6", "수선의 발", String.raw`P(3,4),\quad x\text{축 위로 정사영}`, String.raw`H=(3,0)`, [String.raw`H=(0,4)`, String.raw`H=(3,4)`, String.raw`H=(0,3)`]),
  item("g7", "두 직선의 수직", String.raw`\vec d_1=(2,-1),\quad\vec d_2=(k,4)`, String.raw`k=2`, [String.raw`k=-2`, String.raw`k=4`, String.raw`k=-4`]),
];

export const spaceCoordinateProblems: GeometryChoiceItem[] = [
  item("s1", "공간에서 두 점 사이의 거리", String.raw`A(1,-2,3),\quad B(5,1,-1)`, String.raw`\sqrt{41}`, [String.raw`\sqrt{33}`, String.raw`5`, String.raw`41`]),
  item("s2", "선분의 중점", String.raw`A(1,2,-3),\quad B(5,-4,7)`, String.raw`(3,-1,2)`, [String.raw`(6,-2,4)`, String.raw`(2,-3,5)`, String.raw`(3,1,-2)`]),
  item("s3", "내분점", String.raw`AP:PB=2:1,\quad A(0,3,6),\ B(6,0,-3)`, String.raw`P=(4,1,0)`, [String.raw`P=(2,2,3)`, String.raw`P=(3,1,0)`, String.raw`P=(4,2,-1)`]),
  item("s4", "구의 중심과 반지름", String.raw`x^2+y^2+z^2-4x+6y-2z-11=0`, String.raw`C=(2,-3,1),\ r=5`, [String.raw`C=(-2,3,-1),\ r=5`, String.raw`C=(2,-3,1),\ r=25`, String.raw`C=(4,-6,2),\ r=5`]),
  item("s5", "구의 방정식", String.raw`C=(-1,2,3),\quad r=4`, String.raw`(x+1)^2+(y-2)^2+(z-3)^2=16`, [String.raw`(x-1)^2+(y+2)^2+(z+3)^2=16`, String.raw`(x+1)^2+(y-2)^2+(z-3)^2=4`, String.raw`(x-1)^2+(y-2)^2+(z-3)^2=16`]),
  item("s6", "좌표평면에 대칭인 점", String.raw`P(2,-5,3)\text{를 }xy\text{평면에 대칭}`, String.raw`(2,-5,-3)`, [String.raw`(-2,5,3)`, String.raw`(2,5,3)`, String.raw`(-2,-5,3)`]),
  item("s7", "공간에서의 위치 관계", String.raw`P(a,b,c)\text{가 }yz\text{평면 위}`, String.raw`a=0`, [String.raw`b=0`, String.raw`c=0`, String.raw`a=b=c`]),
];
