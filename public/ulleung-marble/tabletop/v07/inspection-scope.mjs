// A game inspection is fixed to the component chosen by its parent window.
export function inspectionScope(search, hash, catalog) {
 if(new URLSearchParams(search).get('inspection')!=='1') return null;
 const p=new URLSearchParams(hash.replace(/^#/,'')),kind=hash.replace(/^#/,'').split('&')[0];
 if(kind==='cards'&&catalog.cards.some(c=>c.id===p.get('id')))return Object.freeze({kind,id:p.get('id'),hash:'#cards&id='+encodeURIComponent(p.get('id'))});
 if(kind==='sheets'&&/^\d+$/.test(p.get('character')||'')&&catalog.characters.some(c=>c.id===Number(p.get('character')))){
  const character=Number(p.get('character')),course=catalog.routes.some(c=>c.id===p.get('course'))?p.get('course'):null;
  return Object.freeze({kind,character,course,hash:'#sheets&character='+character+(course?'&course='+encodeURIComponent(course):'')});
 }
 if(kind==='manual')return Object.freeze({kind,hash:'#manual'});
 return Object.freeze({kind:'invalid',hash:''});
}
