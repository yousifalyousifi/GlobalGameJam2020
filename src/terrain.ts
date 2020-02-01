

export class Terrain
{
  
  constructor() {
    

  }
  create(scene: Phaser.Scene) {
    const yOffset = 500;

    // Make some rough sample tiles
    let level: number[][] = [];
    for (let row = 0; row < 50; row++) {
      let line: number[] = [];
      level.push(line);
      for (let col = 0; col < 100; col++) {
        if (col / 2 < row)
            line.push(0);
        else
            line.push(1);
      }
    }

    // Create a tilemap and tileset
    const map = scene.make.tilemap({data: level, tileWidth: 2, tileHeight: 2});
    const tiles = map.addTilesetImage("ground-tiles");
    const layer = map.createStaticLayer(0, tiles, 0, yOffset);

    // Create physics bodies for the tiles
    let staticGroup = scene.matter.add
    for (let row = 0; row < 50; row++) {
        for (let col = 0; col < 100; col++) {
          if (level[row][col] == 1) continue;
          let rect = scene.matter.add.rectangle(col * 2, row * 2 + yOffset, 2, 2, { chamfer:{radius: 0.5}, restitution: 0.5 });
          rect.isStatic = true;
        }
    }
  }
}