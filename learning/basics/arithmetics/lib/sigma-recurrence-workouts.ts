export type SigmaRecurrenceKind="linear-sigma"|"square-sigma"|"geometric-sigma"|"difference-recurrence"|"affine-recurrence";
export type SigmaRecurrenceProblem={id:string;kind:SigmaRecurrenceKind;label:string;prompt:string;latex:string;answer:number};
const KINDS:SigmaRecurrenceKind[]=["linear-sigma","square-sigma","geometric-sigma","difference-recurrence","affine-recurrence"];
function random(seed:number){let v=seed>>>0;return()=>{v+=0x6d2b79f5;let n=v;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return((n^(n>>>14))>>>0)/4294967296}}
function int(next:()=>number,min:number,max:number){return min+Math.floor(next()*(max-min+1))}
function signed(v:number){return v===0?"":v<0?String(v):`+${v}`}
function build(kind:SigmaRecurrenceKind,next:()=>number,id:string):SigmaRecurrenceProblem{
 if(kind==="linear-sigma"){const a=int(next,2,5),b=int(next,-4,4),n=int(next,5,9);return{id,kind,label:"합의 분리",prompt:"합을 구하세요.",latex:`\\sum_{k=1}^{${n}}(${a}k${signed(b)})`,answer:a*n*(n+1)/2+b*n}}
 if(kind==="square-sigma"){const n=int(next,4,8),c=int(next,1,4);return{id,kind,label:"제곱의 합",prompt:"합을 구하세요.",latex:`\\sum_{k=1}^{${n}}(k^2+${c}k)`,answer:n*(n+1)*(2*n+1)/6+c*n*(n+1)/2}}
 if(kind==="geometric-sigma"){const r=int(next,2,3),n=int(next,4,6);return{id,kind,label:"등비수열의 합",prompt:"합을 구하세요.",latex:`\\sum_{k=0}^{${n-1}}${r}^{k}`,answer:(r**n-1)/(r-1)}}
 if(kind==="difference-recurrence"){const first=int(next,-5,8),d=int(next,2,6),n=int(next,7,12);return{id,kind,label:"등차형 점화식",prompt:"주어진 항을 구하세요.",latex:`a_1=${first},\\quad a_{n+1}=a_n${signed(d)},\\quad a_{${n}}`,answer:first+(n-1)*d}}
 const first=int(next,1,4),r=2,c=int(next,1,3),n=int(next,4,6);let value=first;for(let i=1;i<n;i++)value=r*value+c;return{id,kind,label:"1차 점화식",prompt:"주어진 항을 구하세요.",latex:`a_1=${first},\\quad a_{n+1}=${r}a_n+${c},\\quad a_{${n}}`,answer:value}
}
export function createSigmaRecurrenceSet(seed:number){const next=random(seed);return{seed,problems:KINDS.map((k,i)=>build(k,next,`sigma-recurrence-${i}`))}}
export function createSigmaRecurrenceReviews(kinds:SigmaRecurrenceKind[],seed:number){const next=random(seed);return[...new Set(kinds)].slice(0,2).map((k,i)=>build(k,next,`sigma-recurrence-review-${i}-${seed}`))}
export function sameSigmaRecurrenceAnswer(value:string,answer:number){return/^-?\d+$/.test(value)&&Number(value)===answer}
