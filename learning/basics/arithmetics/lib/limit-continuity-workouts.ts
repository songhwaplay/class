export type LimitKind="factorization"|"rationalization"|"infinity"|"one-sided"|"continuity";
export type LimitProblem={id:string;kind:LimitKind;label:string;prompt:string;latex:string;answerLabels:string[];answers:number[]};
const KINDS:LimitKind[]=["factorization","rationalization","infinity","one-sided","continuity"];
function random(seed:number){let v=seed>>>0;return()=>{v+=0x6d2b79f5;let n=v;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return((n^(n>>>14))>>>0)/4294967296}}
function int(next:()=>number,min:number,max:number){return min+Math.floor(next()*(max-min+1))}
function signed(v:number){if(v===0)return"";return v<0?String(v):`+${v}`}
function term(v:number,symbol:string){if(v===0)return"";const magnitude=Math.abs(v)===1?"":Math.abs(v);return`${v<0?"-":"+"}${magnitude}${symbol}`}
function build(kind:LimitKind,next:()=>number,id:string):LimitProblem{
 if(kind==="factorization"){const a=int(next,2,5);return{id,kind,label:"세제곱식의 인수분해",prompt:"극한값을 구하세요.",latex:`\\lim_{x\\to${a}}\\frac{x^3-${a**3}}{x-${a}}`,answerLabels:["극한값"],answers:[3*a*a]}}
 if(kind==="rationalization"){const s=int(next,2,5),a=int(next,1,5),c=s*s-a;return{id,kind,label:"유리화",prompt:"극한값을 구하여 m의 값을 구하세요.",latex:`\\lim_{x\\to${a}}\\frac{\\sqrt{x${signed(c)}}-${s}}{x-${a}}=\\frac1m`,answerLabels:["m"],answers:[2*s]}}
 if(kind==="infinity"){const top=int(next,2,6),bottom=int(next,2,5),b=int(next,-6,6);return{id,kind,label:"최고차항의 차수와 계수",prompt:"극한값을 구하세요.",latex:`\\lim_{x\\to\\infty}\\frac{${top*bottom}x^3${term(b,"x^2")}+1}{${bottom}x^3-3x+2}`,answerLabels:["극한값"],answers:[top]}}
 if(kind==="one-sided"){const a=int(next,2,6),m=int(next,2,5),b=int(next,1,6),value=m*a+b;return{id,kind,label:"절댓값과 좌우극한",prompt:"좌극한과 우극한을 각각 구하세요.",latex:`\\lim_{x\\to${a}^{-}}\\frac{(x-${a})(${m}x+${b})}{|x-${a}|},\\qquad \\lim_{x\\to${a}^{+}}\\frac{(x-${a})(${m}x+${b})}{|x-${a}|}`,answerLabels:["좌극한","우극한"],answers:[-value,value]}}
 const a=int(next,2,5),b=int(next,-4,4),c=int(next,1,6);const q=b-a,r=c-a*b,s=-a*c,value=a*a+b*a+c;return{id,kind,label:"제거 가능한 불연속",prompt:"주어진 점에서 연속이 되도록 k의 값을 구하세요.",latex:`f(x)=\\begin{cases}\\dfrac{x^3${term(q,"x^2")}${term(r,"x")}${signed(s)}}{x-${a}}&(x\\ne${a})\\\\k&(x=${a})\\end{cases}`,answerLabels:["k"],answers:[value]}
}
export function createLimitSet(seed:number){const next=random(seed);return{seed,problems:KINDS.map((k,i)=>build(k,next,`limit-${i}`))}}
export function createLimitReviews(kinds:LimitKind[],seed:number){const next=random(seed);return[...new Set(kinds)].slice(0,2).map((k,i)=>build(k,next,`limit-review-${i}-${seed}`))}
export function sameLimitAnswers(values:string[],answers:number[]){return values.length===answers.length&&values.every((v,i)=>/^-?\d+$/.test(v)&&Number(v)===answers[i])}
