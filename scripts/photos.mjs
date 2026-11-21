import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const source = process.argv[2];
if (!source) throw new Error('Укажите путь к папке оригинальных фотографий первым аргументом.');
const selection = [
 ['5364195346055112279','Студия с двуспальной кроватью и зелёной мини-кухней','Интерьеры'],
 ['5364195346055112323','Студия с двумя кроватями, столом и кондиционером','Интерьеры'],
 ['5364195346055112309','Студия в красных тонах с кроватями и диваном','Интерьеры'],
 ['5364195346055112315','Студия с раздельными кроватями и обеденным столом','Интерьеры'],
 ['5364195346055112282','Мини-кухня с холодильником, микроволновой печью и чайником','Кухонные зоны'],
 ['5364195346055112316','Студия с цветочными обоями, кроватью и креслом','Интерьеры'],
 ['5364195346055112317','Кухонная зона с плитой и холодильником','Кухонные зоны'],
 ['5364195346055112289','Кровать и обеденная зона в студии с коричневыми стенами','Интерьеры'],
 ['5364195346055112294','Три спальных места в студии с тёплыми жёлтыми стенами','Интерьеры'],
 ['5364195346055112324','Двуспальная кровать в студии с зелёной стеной','Детали'],
 ['5364195346055112306','Подушки и сложенные полотенца на кровати','Детали']
];
await mkdir('public/photos',{recursive:true});
const photos=[];
for (const [id,alt,group] of selection) {
 const input=join(source,id+'.jpg');
 const meta=await sharp(input).metadata();
 for(const width of [480,1080]) await sharp(input).rotate().resize({width,withoutEnlargement:true}).webp({quality:83}).toFile(`public/photos/${id}-${width}.webp`);
 await sharp(input).rotate().jpeg({quality:85}).toFile(`public/photos/${id}.jpg`);
 photos.push({id,alt,group,width:meta.width,height:meta.height,src:`/photos/${id}.jpg`,webp:`/photos/${id}-1080.webp`,small:`/photos/${id}-480.webp`});
}
await writeFile('src/config/photos.json',JSON.stringify(photos,null,2)+'\n');
console.log(`Подготовлено ${photos.length} снимков, оригиналы сохранены без изменений.`);
