import * as Phaser from 'phaser';

export class Terrain
{
  
  constructor() {
    

  }
  create(scene: Phaser.Scene) {
    const yOffset = 720-192;

    // Make some rough sample tiles
    let level: number[][] = [];
    for (let row = 0; row < 1; row++) {
      let line: number[] = [];
      level.push(line);
      for (let col = 0; col < 100; col++) {
        line.push(0);
      }
    }

    // Create a tilemap and tileset
    const tileWidth = 64;
    const map = scene.make.tilemap({data: level, tileWidth: tileWidth, tileHeight: 192});
    const tiles = map.addTilesetImage("ground-tiles");
    const layer = map.createStaticLayer(0, tiles, 0, yOffset);

    // Create physics bodies for the tiles
    let staticGroup = scene.matter.add
    for (let row = 0; row < level.length; row++) {
        for (let col = 0; col < level[row].length; col++) {
          if (level[row][col] == 1) continue;
          let rect = scene.matter.add.rectangle(col * tileWidth, row * 2 + yOffset, tileWidth, 2, { chamfer:{radius: 0.5}, restitution: 0.5 });
          rect.isStatic = true;
        }
    }
  }
}