/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
// Compare only the start of this response with the existing chapter's ending.
// Ignore layout whitespace, not punctuation, case or wording. Never edit the base.
export function createContinuationFilter(base, onText) {
  const tail=Array.from(base).slice(-4096).filter(c=>! /\s/u.test(c));
  const letters=Array(tail.length+1).fill(0);
  for(let i=tail.length-1;i>=0;i--)letters[i]=letters[i+1]+(/[\p{L}\p{N}]/u.test(tail[i])?1:0);
  let pending='',active=null,matched=0,cut=0,rawPosition=0,released=false,ended=false,removed=0;
  function release(){
    if(released)return;
    released=true;removed=cut;
    const text=pending.slice(cut);pending='';active=null;
    if(text)onText(text);
  }
  function write(chunk){
    if(ended||!chunk)return;
    if(released){onText(chunk);return;}
    pending+=chunk;
    for(const c of chunk){
      rawPosition+=c.length;
      if(/\s/u.test(c))continue;
      if(active===null){
        active=[];
        for(let i=0;i<tail.length;i++)if(tail[i]===c&&letters[i]>=8)active.push(i);
      }
      const next=[];
      for(const start of active){
        if(tail[start+matched]!==c)continue;
        if(start+matched+1===tail.length)cut=rawPosition;
        else next.push(start);
      }
      matched++;active=next;
      if(!active.length){release();return;}
    }
    // Bound a pathological whitespace-heavy response; preserve undecided text.
    if(pending.length>=16384)release();
  }
  function finish(){if(ended)return;ended=true;release();}
  return {write,finish,get removedCharacters(){return removed;}};
}
