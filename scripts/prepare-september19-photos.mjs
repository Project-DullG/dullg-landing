import sharp from "sharp";
import { mkdir } from "node:fs/promises";

// Coordinates refer to the 1824 × 1368 preview. Originals stay outside public/.
const inputs = process.argv.slice(2);
if (inputs.length !== 2) throw new Error("Provide the workshop and lecture photo paths, in that order.");
const photos = [
  { name: "workshop", boxes: [[735,665,85,110],[365,925,205,215],[515,862,125,165],[727,798,105,147],[1214,755,112,140],[1300,785,86,128],[1600,790,150,156],[1368,945,196,193]] },
  { name: "class", boxes: [[386,525,73,87],[574,537,78,100],[733,638,108,148],[903,588,117,138],[982,536,86,105],[1061,640,126,135],[1172,550,108,127],[1680,537,125,108],[1055,417,65,80]] },
];
const out = new URL("../public/assets/activities/", import.meta.url);
await mkdir(out, {recursive:true});
for (const [index, photo] of photos.entries()) {
  const original = await sharp(inputs[index]).rotate().resize(1824,1368,{fit:"fill"}).png().toBuffer();
  const overlays = await Promise.all(photo.boxes.map(async ([left,top,width,height]) => ({
    left, top,
    input: await sharp(await sharp(original).extract({left,top,width,height}).resize(5,5,{fit:"fill"}).png().toBuffer())
      .resize(width,height,{kernel:"nearest",fit:"fill"}).png().toBuffer(),
  })));
  const redacted = await sharp(original).composite(overlays).png().toBuffer();
  const file = new URL(`ulleung-high-2026-09-19-${photo.name}.webp`,out);
  await sharp(redacted).resize(1600,1200).webp({quality:83}).toFile(file.pathname);
  console.log(file.pathname);
}
