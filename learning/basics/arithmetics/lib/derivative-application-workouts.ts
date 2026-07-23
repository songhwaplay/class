export type DerivativeApplicationKind =
  | "tangent-line"
  | "stationary-points"
  | "extrema-values"
  | "tangent-parameter"
  | "velocity-acceleration";

export type DerivativeApplicationProblem = {
  id: string;
  kind: DerivativeApplicationKind;
  label: string;
  prompt: string;
  latex: string;
  answerLabels: string[];
  answers: number[];
};

const KINDS: DerivativeApplicationKind[] = [
  "tangent-line", "stationary-points", "extrema-values", "tangent-parameter", "velocity-acceleration",
];

function random(seed:number){let value=seed>>>0;return()=>{value+=0x6d2b79f5;let result=value;result=Math.imul(result^(result>>>15),result|1);result^=result+Math.imul(result^(result>>>7),result|61);return((result^(result>>>14))>>>0)/4294967296}}
function integer(next:()=>number,min:number,max:number){return Math.floor(next()*(max-min+1))+min}
function signed(value:number){if(value===0)return"";return value<0?String(value):`+${value}`}
function signedTerm(value:number,symbol:string){if(value===0)return"";const magnitude=Math.abs(value)===1?"":Math.abs(value);return`${value<0?"-":"+"}${magnitude}${symbol}`}
function leadingTerm(value:number,symbol:string){return`${value===1?"":value}${symbol}`}

function build(kind:DerivativeApplicationKind,next:()=>number,id:string):DerivativeApplicationProblem{
  if(kind==="tangent-line"){
    const p=integer(next,-4,4),q=integer(next,-5,5),x=integer(next,-2,2);
    const y=x**3+p*x*x+q*x,m=3*x*x+2*p*x+q,b=y-m*x;
    return{id,kind,label:"접선의 방정식",prompt:"주어진 점에서의 접선을 y=mx+b로 나타낼 때 m, b를 구하세요.",latex:`f(x)=x^3${signedTerm(p,"x^2")}${signedTerm(q,"x")},\\qquad x=${x}`,answerLabels:["m","b"],answers:[m,b]};
  }
  if(kind==="stationary-points"){
    const parity=integer(next,0,1),r=-integer(next,1,3)*2+parity,s=integer(next,1,3)*2+parity;
    const quadratic=-3*(r+s)/2,linear=3*r*s;
    return{id,kind,label:"증가와 감소의 경계",prompt:"함수의 증가와 감소가 바뀔 수 있는 두 x값을 작은 것부터 구하세요.",latex:`f(x)=x^3${signedTerm(quadratic,"x^2")}${signedTerm(linear,"x")}`,answerLabels:["x_1","x_2"],answers:[r,s]};
  }
  if(kind==="extrema-values"){
    const a=integer(next,1,3),constant=integer(next,-4,4);
    return{id,kind,label:"극댓값과 극솟값",prompt:"함수의 극댓값과 극솟값을 구하세요.",latex:`f(x)=x^3-${3*a*a}x${signed(constant)}`,answerLabels:["극댓값","극솟값"],answers:[2*a**3+constant,-2*a**3+constant]};
  }
  if(kind==="tangent-parameter"){
    const x=integer(next,1,3),a=integer(next,-4,4),q=integer(next,-3,3),slope=3*x*x+2*a*x+q;
    return{id,kind,label:"접선의 기울기와 매개변수",prompt:"주어진 점에서의 접선이 직선과 평행하도록 a를 구하세요.",latex:`f(x)=x^3+ax^2${signed(q)}x,\\qquad x=${x},\\qquad y=${slope}x+1`,answerLabels:["a"],answers:[a]};
  }
  const a=integer(next,1,3),b=integer(next,-4,4),c=integer(next,-5,5),t=integer(next,1,3);
  return{id,kind,label:"속도와 가속도",prompt:"주어진 시각의 속도와 가속도를 각각 구하세요.",latex:`s(t)=${leadingTerm(a,"t^3")}${signedTerm(b,"t^2")}${signedTerm(c,"t")},\\qquad t=${t}`,answerLabels:[`v(${t})`,`a(${t})`],answers:[3*a*t*t+2*b*t+c,6*a*t+2*b]};
}

export function createDerivativeApplicationSet(seed:number){const next=random(seed);return{seed,problems:KINDS.map((kind,index)=>build(kind,next,`derivative-application-${index}`))}}
export function createDerivativeApplicationReviews(kinds:DerivativeApplicationKind[],seed:number){const next=random(seed);return[...new Set(kinds)].slice(0,2).map((kind,index)=>build(kind,next,`derivative-application-review-${index}-${seed}`))}
export function sameDerivativeApplicationAnswers(values:string[],expected:number[]){return values.length===expected.length&&values.every((value,index)=>value.trim()!==""&&Number(value)===expected[index])}
