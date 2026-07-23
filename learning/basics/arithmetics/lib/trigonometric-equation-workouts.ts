export type PiValue={n:number;d:number}; export type TrigEquationProblem={id:string;kind:string;label:string;prompt:string;latex:string;answers:PiValue[];interval?:boolean};
const BANK=[
 {kind:"sine",label:"사인방정식",prompt:"주어진 구간에서 모든 해를 구하세요.",latex:"\\sin x=\\frac12,\\qquad 0\\le x<2\\pi",answers:[{n:1,d:6},{n:5,d:6}]},
 {kind:"cosine",label:"코사인방정식",prompt:"주어진 구간에서 모든 해를 구하세요.",latex:"\\cos x=-\\frac{\\sqrt2}{2},\\qquad 0\\le x<2\\pi",answers:[{n:3,d:4},{n:5,d:4}]},
 {kind:"tangent",label:"탄젠트방정식",prompt:"주어진 구간에서 모든 해를 구하세요.",latex:"\\tan x=1,\\qquad 0\\le x<2\\pi",answers:[{n:1,d:4},{n:5,d:4}]},
 {kind:"substitution",label:"치환형",prompt:"주어진 구간에서 모든 해를 구하세요.",latex:"2\\sin^2x-3\\sin x+1=0,\\qquad 0\\le x<2\\pi",answers:[{n:1,d:6},{n:1,d:2},{n:5,d:6}]},
 {kind:"double-angle",label:"배각방정식",prompt:"주어진 구간에서 모든 해를 구하세요.",latex:"\\sin 2x=0,\\qquad 0\\le x<2\\pi",answers:[{n:0,d:1},{n:1,d:2},{n:1,d:1},{n:3,d:2}]},
 {kind:"inequality",label:"삼각부등식",prompt:"주어진 구간에서 해가 되는 닫힌 구간의 양 끝을 구하세요.",latex:"\\sin x\\ge\\frac12,\\qquad 0\\le x<2\\pi",answers:[{n:1,d:6},{n:5,d:6}],interval:true},
] satisfies Omit<TrigEquationProblem,"id">[];
function random(seed:number){let v=seed>>>0;return()=>{v+=0x6d2b79f5;let n=v;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return((n^(n>>>14))>>>0)/4294967296}}
export function createTrigEquationSet(seed:number){const next=random(seed);const first=next()<.5?BANK[0]:BANK[1];return{seed,problems:[first,BANK[2],BANK[3],BANK[4],BANK[5]].map((p,i)=>({...p,id:`trig-equation-${i}`}))}}
export function samePiAnswers(values:{n:string;d:string}[],answers:PiValue[]){return values.length===answers.length&&values.every((v,i)=>/^-?\d+$/.test(v.n)&&/^\d+$/.test(v.d)&&Number(v.n)*answers[i].d===answers[i].n*Number(v.d))}
export function piLatex(v:PiValue){if(v.n===0)return"0";if(v.d===1)return v.n===1?"\\pi":`${v.n}\\pi`;return`\\frac{${v.n}\\pi}{${v.d}}`}
