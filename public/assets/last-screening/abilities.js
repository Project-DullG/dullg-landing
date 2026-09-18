(function(root){
'use strict';
const data=()=>root.ECHO_DATA||{};
function catalog(){return Array.isArray(data().coreAbilities)?data().coreAbilities:[];}
function rules(){return Array.isArray(data().abilityRules)?data().abilityRules:[];}
function counts(g){return {evidence:g?.evidence?.length||0,observed:g?.observed?.length||0,solved:g?.solved?.length||0};}
function basicStatus(g){
 const entered=!!g?.echo?.entered,closed=!!g?.caseClosed,completed=!!g?.completed;
 const c=counts(g);
 return {
  reconstruct:{ready:entered,label:!entered?'의뢰 접수 후 사용':completed?'종결 기록에서 다시 확인 가능':closed?'현장 기록 열람 가능':'현재 사건에서 사용 가능',metric:`현장 관찰 ${c.observed}곳`},
  crosscheck:{ready:c.evidence>=2,label:c.evidence>=2?'확보한 자료로 사용 가능':'자료 2개 이상 필요',metric:`확보 자료 ${c.evidence}건`},
  focus:{ready:entered,label:entered?'현재 사건에서 사용 가능':'의뢰 접수 후 사용',metric:`입증 논점 ${c.solved}건`}
 };
}
root.ABILITY={catalog,rules,counts,basicStatus};
})(typeof window!=='undefined'?window:globalThis);
