

export class Terrain
{
  
  constructor() {
    

  }
  create(scene: Phaser.Scene) {
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
    const layer = map.createStaticLayer(0, tiles, 0, 100);
  }
}