/* 0.12 — Korean clock notation only. Source manuscript and stable line IDs stay intact.
 * No conversion to 24-hour time without an authored, unambiguous context.
 */
(function(root){'use strict';
 const D=root.STORY,M=root.MODEL;
 const native={'한':1,'하나':1,'두':2,'둘':2,'세':3,'셋':3,'네':4,'넷':4,'다섯':5,'여섯':6,'일곱':7,'여덟':8,'아홉':9,'열':10,'열한':11,'열두':12,'스물':20,'스물한':21,'스물두':22,'서른':30,'서른다섯':35};
 const digit={'일':1,'이':2,'삼':3,'사':4,'오':5,'육':6,'칠':7,'팔':8,'구':9};
 function number(s){if(native[s]!==undefined)return native[s];if(s==='십')return 10;const a=s.split('십');if(a.length===2)return (a[0]?digit[a[0]]:1)*10+(a[1]?digit[a[1]]:0);return digit[s];}
 const nativeNames=Object.keys(native).sort((a,b)=>b.length-a.length).join('|');
 const hours=new RegExp('(?<![가-힣0-9])('+nativeNames+')\\s*(시간|시)(?=$|[^가-힣]|[에을를은는가이로쯤부까의와과도])','g');
 // Minutes use Sino-Korean; restrict to clocks with 분. “직원 세 분” is not time.
 const minutes=/(?<![가-힣0-9])((?:[이삼사오]?십[일이삼사오육칠팔구]?)|[일삼사오육칠팔구]|서른다섯)\s*분(?=$|[^가-힣]|[에을은는가이입쯤부까의도])/g;
 function format(t){
  if(typeof t!=='string')return t;
  return t.replace(hours,(_,n,u)=>number(n)+u).replace(minutes,(_,n)=>number(n)+'분')
   .replace(/(\d+)시\s*반(?=$|[\s,.?!은에을이쯤의])/g,'$1시 30분')
   .replace(/(\d+)\s+시\s+(\d+)\s+분/g,'$1시 $2분')
   .replace(/(\d+)시\s+(\d+)\s+분/g,'$1시 $2분');
 }
 const edits=[],aliases=new Map(),statements=new Map();
 const lines=(kind,ref,d,variant=-1)=>{
  for(let i=0;i<(d.lines||[]).length;i++){
   const l=d.lines[i],id=`${kind}/${ref}/${variant>=0?'v'+variant+'/':''}${i}`,before=l.text;
   let after=format(before);
   // The sentence itself supplies the evening context. Do not infer new event times.
   if(id==='topic/t_recording/0')after='18시 20분에 대표 목소리를 녹음했습니다. 18시 35분에 21시로 예약했고요.';
   if(before!==after){l.text=after;aliases.set(id,{who:l.who,before,after});edits.push({id,who:l.who,before,after});}
  }
 };
 for(const [id,d] of Object.entries(D.scenes)){lines('scene',id,d);(d.variants||[]).forEach((v,j)=>lines('scene',id,v,j));}
 for(const t of D.topics){lines('topic',t.id,t);(t.variants||[]).forEach((v,j)=>lines('topic',t.id,v,j));const before=t.statement,after=format(before);if(before!==after){statements.set(t.id,{before,after});t.statement=after;}}
 for(const p of Object.values(D.places))for(const h of p.hotspots)lines('hotspot',h.id,h);
 // Display-only fields. Do not process identifiers, numerical rules, gates or asset paths.
 function displayTree(o){for(const [k,v] of Object.entries(o||{})){if(typeof v==='string'&&['text','label','heading','name','description','question','result','feedback','source','limit','title','bio'].includes(k))o[k]=format(v);else if(Array.isArray(v)&&['facts','paragraphs','rows','columns'].includes(k))o[k]=v.map(x=>Array.isArray(x)?x.map(format):format(x));else if(v&&typeof v==='object')displayTree(v);}}
 displayTree(D.evidence);for(const x of Object.values(D.previews||{}))for(const l of x.lines||[])l.text=format(l.text);
 function migrateLog(log){for(const l of log||[]){const e=aliases.get(l.id);if(e&&l.who===e.who&&l.text===e.before)l.text=e.after;}}
 function migrateStatements(items){for(const x of items||[]){const e=statements.get(x.id);if(e&&x.text===e.before)x.text=e.after;}}
 root.TIME_STYLE={format,edits,migrateLog,migrateStatements};
 if(typeof module!=='undefined')module.exports=root.TIME_STYLE;
})(typeof window!=='undefined'?window:globalThis);
