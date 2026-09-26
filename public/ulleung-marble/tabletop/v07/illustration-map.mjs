import {ILLUSTRATIONS as I} from './illustrations.mjs';
import {ART} from './art.mjs';
export const art=(key,fallback='scenery')=>I[key]||ART[fallback];
export const places={sadong:'port',dodong:'port',jeodong:'port',haengnam:'gwanum',candle:'stacks','dokdo-museum':'port',nari:'nari',cheonbu:'port',seongin:'seongin',bongrae:'bongrae',naesujeon:'seongin',gwanum:'gwanum',hyeonpo:'arch',taeha:'lighthouse',daepung:'lighthouse',tonggumi:'turtle',namyang:'coast',samseon:'stacks',seokpo:'seongin',heaven:'nari',undersea:'arch',yerim:'nari','hyeonpo-view':'arch',manmul:'coast',hakpo:'coast',suto:'lighthouse',camel:'coast',lion:'turtle','pebble-tonggumi':'turtle','naesujeon-beach':'coast'};
export const placeArt=id=>art(places[id]||'coast');
const food=['food-squid','food-dried-squid','food-squid-bulgogi','food-mussel-rice','food-limpet-rice','food-limpet-noodle','food-beef','food-myeongi','food-bujigaengi','food-bibimbap','food-pumpkin','food-shrimp','food-mulhoe','food-sashimi','food-miyeok','food-gim'];
const scenery=['coast','port','stacks','gwanum','bongrae','seongin','seongin','turtle','lighthouse','lighthouse','arch','nari','gwanum','stacks','arch','dokdo'];
const activity=['coast','lighthouse','gwanum','nari','seongin','bongrae','gwanum','port','port','port','nari','nari','coast','port','port','seongin','lighthouse','food-pumpkin','dokdo','lighthouse'];
const fatigue=['nari','coast','port','nari','port','nari','nari','food-myeongi','food-dried-squid','lighthouse','coast','coast','port','dokdo','nari','nari'];
export function recordArt(type,index=0){return art(({food,scenery,activity,fatigue,lap:['coast','coast','port','coast']}[type]||scenery)[index%({food,scenery,activity,fatigue,lap:[1,2,3,4]}[type]?.length||1)],type);}
export function encounterArt(c){return art(c.art||({teal:'port',blue:'bongrae',orange:'coast',ochre:'lighthouse',green:'nari'}[c.region]));}
