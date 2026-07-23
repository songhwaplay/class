export type SequenceKind="arithmetic-term"|"arithmetic-difference"|"arithmetic-sum"|"geometric-term"|"geometric-sum";
export type SequenceProblem={id:string;kind:SequenceKind;label:string;prompt:string;latex:string;answer:number};
const KINDS:SequenceKind[]=["arithmetic-term","arithmetic-difference","arithmetic-sum","geometric-term","geometric-sum"];
function random(seed:number){let v=seed>>>0;return()=>{v+=0x6d2b79f5;let n=v;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return((n^(n>>>14))>>>0)/4294967296}}
function int(next:()=>number,min:number,max:number){return min+Math.floor(next()*(max-min+1))}
function build(kind:SequenceKind,next:()=>number,id:string):SequenceProblem{
 if(kind==="arithmetic-term"){const a=int(next,-8,8),d=int(next,2,6),n=int(next,8,15);return{id,kind,label:"등차수열의 항",prompt:"주어진 항을 구하세요.",latex:`a_1=${a},\\ d=${d},\\quad a_{${n}}`,answer:a+(n-1)*d}}
 if(kind==="arithmetic-difference"){const a=int(next,-5,8),d=int(next,2,7),p=int(next,2,5),q=p+int(next,3,6);return{id,kind,label:"공차 구하기",prompt:"공차를 구하세요.",latex:`a_{${p}}=${a+(p-1)*d},\\quad a_{${q}}=${a+(q-1)*d}`,answer:d}}
 if(kind==="arithmetic-sum"){const a=int(next,-4,6),d=int(next,1,5),n=int(next,6,12);return{id,kind,label:"등차수열의 합",prompt:"주어진 합을 구하세요.",latex:`a_1=${a},\\ d=${d},\\quad S_{${n}}`,answer:n*(2*a+(n-1)*d)/2}}
 if(kind==="geometric-term"){const a=int(next,1,4),r=int(next,2,3),n=int(next,5,7);return{id,kind,label:"등비수열의 항",prompt:"주어진 항을 구하세요.",latex:`a_1=${a},\\ r=${r},\\quad a_{${n}}`,answer:a*r**(n-1)}}
 const a=int(next,1,3),r=int(next,2,3),n=int(next,4,6);return{id,kind,label:"등비수열의 합",prompt:"주어진 합을 구하세요.",latex:`a_1=${a},\\ r=${r},\\quad S_{${n}}`,answer:a*(r**n-1)/(r-1)}
}
export function createSequenceSet(seed:number){const next=random(seed);return{seed,problems:KINDS.map((k,i)=>build(k,next,`sequence-${i}`))}}
export function createSequenceReviews(kinds:SequenceKind[],seed:number){const next=random(seed);return[...new Set(kinds)].slice(0,2).map((k,i)=>build(k,next,`sequence-review-${i}-${seed}`))}
export function sameSequenceAnswer(value:string,answer:number){return/^-?\d+$/.test(value)&&Number(value)===answer}
