import * as Phaser from 'phaser';

export class Terrain
{
  heightMap: number[] = [];

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
    level[0][17] = 1;

    // Create a tilemap and tileset
    const tileWidth = 64;
    const map = scene.make.tilemap({data: level, tileWidth: tileWidth, tileHeight: 192});
    const tiles = map.addTilesetImage("ground-tiles");
    const layer = map.createStaticLayer(0, tiles, 0, yOffset);

    // Create a height map for the level at a resolution of 4 pixels each
    const HEIGHTMAP_RESOLUTION = 4;
    const HEIGHTMAP_YRESOLUTION = 4;
    const holeHeightMap = [0, 1, 1, 2, 3, 3, 4, 5, 5, 4, 4, 3, 2, 2, 1, 0];
    for (let col = 0; col < level[0].length; col++)
    {
      if (level[0][col] == 0) {
         for (let ii = 0; ii < 64 / HEIGHTMAP_RESOLUTION; ii ++)
           this.heightMap.push(0);
      } else if (level[0][col] == 1) {
        for (let ii = 0; ii < holeHeightMap.length; ii++)
          this.heightMap.push(holeHeightMap[ii]);
      }
    }

    // Create physics bodies from the height map
    const PHYSICS_BODY_HEIGHT = 64;
    for (let start = 0; start < this.heightMap.length; start++) {
      let end = start + 1;
      for (; end < this.heightMap.length && this.heightMap[end] == this.heightMap[start]; end++) { }
      let rect = scene.matter.add.rectangle((start * HEIGHTMAP_RESOLUTION + end * HEIGHTMAP_RESOLUTION) / 2,
        yOffset + this.heightMap[start] * HEIGHTMAP_YRESOLUTION + PHYSICS_BODY_HEIGHT / 2,
        (end - start) * HEIGHTMAP_RESOLUTION,
        PHYSICS_BODY_HEIGHT,
        { chamfer:{radius: 0}, restitution: 0.5 });
      rect.isStatic = true;
      start = end - 1;
    }
  }
}