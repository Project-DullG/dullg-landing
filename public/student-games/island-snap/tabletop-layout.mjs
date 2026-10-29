export const TABLE_SIZE={width:1360,height:920};
export const CENTER_PILE={x:680,y:475,width:140,height:140*88/63};
const arrangements={
  3:[[260,250],[1100,250],[680,790]],
  4:[[260,230],[1100,230],[1100,690],[260,690]],
  5:[[250,230],[680,125],[1110,230],[920,785],[440,785]],
  6:[[250,230],[680,125],[1110,230],[1110,684],[680,790],[250,684]],
};
export function seatPositions(count){if(!arrangements[count])throw new Error('3명에서 6명까지 배치할 수 있어요.');return arrangements[count].map(([x,y],id)=>({id,x,y,left:x-145,top:y-125,width:290,height:250,deckX:x-63,deckY:y+26.7778}));}
