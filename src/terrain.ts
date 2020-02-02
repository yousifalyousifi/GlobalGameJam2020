import * as Phaser from 'phaser';

export const HEIGHTMAP_RESOLUTION = 4;
export const HEIGHTMAP_YRESOLUTION = 4;
export const FINISH_FLAG_X_POSITION = 1500;

export class Terrain
{
  heightMap: number[] = [];

  constructor() {
    

  }
  create(scene: Phaser.Scene, whichLevel: number, backgroundContainer: Phaser.GameObjects.Container, foregroundContainer: Phaser.GameObjects.Container) {
    const yOffset = 720-192;
    const spriteYOffset = 720 - 256;

    const tiled = scene.make.tilemap({ key: "map" });

    // Find all the object images and how they are mapped to gids
    const tiledImageToGidMap : { [key: string] : number} = {};
    tiled.imageCollections[0].images.forEach(img => {
      tiledImageToGidMap[img.image] = img.gid;
    });
    const gidToSpriteMap : { [key: number] : string} = {};
    gidToSpriteMap[tiledImageToGidMap['../placeholder/kenney_foliagePack_005.png']] = 'tree1'
    gidToSpriteMap[tiledImageToGidMap['../placeholder/kenney_foliagePack_006.png']] = 'tree2'

    // Generate sprites for each background object
    tiled.getObjectLayer('Background').objects.forEach(obj => {
      let spriteName = gidToSpriteMap[obj.gid];
      if (!spriteName) return;
      backgroundContainer.add(scene.add.sprite(obj.x + obj.width / 2, obj.y - obj.height / 2, spriteName));
    });


    let flag = scene.add.sprite(FINISH_FLAG_X_POSITION,350, 'flag');
    flag.scale = 0.6
    foregroundContainer.add(flag)

    // Read in the ground tile information from tiled
    const tileset = tiled.addTilesetImage("Ground", "ground-tiles");
    const groundLayer = tiled.createStaticLayer("Ground_Tiles", tileset, 0, spriteYOffset);
    const groundLayerData = groundLayer.layer.data;

    // Create a height map for the level at a resolution of 4 pixels each
    const holeHeightMap = [0, 1, 1, 2, 3, 3, 4, 5, 5, 4, 4, 3, 2, 2, 1, 0];
    for (let col = 0; col < groundLayerData[0].length; col++)
    {
      if (groundLayerData[0][col].index == 1) {
         for (let ii = 0; ii < 64 / HEIGHTMAP_RESOLUTION; ii ++)
           this.heightMap.push(0);
      } else if (groundLayerData[0][col].index == 2) {
        for (let ii = 0; ii < holeHeightMap.length; ii++)
          this.heightMap.push(holeHeightMap[ii]);
      }
    }

    // Create physics bodies from the height map
    for (let start = 0; start < this.heightMap.length; start++) {
      let end = start + 1;
      for (; end < this.heightMap.length && this.heightMap[end] == this.heightMap[start]; end++) { }
      this.createPhysicsRectangleForHeightMap(start, end, yOffset, scene);
      start = end - 1;
    }

  }
  public createPhysicsRectangleForHeightMap(start: number, end: number, yOffset: number, scene: Phaser.Scene)
  {
    const PHYSICS_BODY_HEIGHT = 64;
    let rect = scene.matter.add.rectangle((start * HEIGHTMAP_RESOLUTION + end * HEIGHTMAP_RESOLUTION) / 2,
      yOffset + this.heightMap[start] * HEIGHTMAP_YRESOLUTION + PHYSICS_BODY_HEIGHT / 2,
      (end - start) * HEIGHTMAP_RESOLUTION,
      PHYSICS_BODY_HEIGHT,
      { label: "GameFloor", chamfer:{radius: 2}, restitution: 0.5 });
    rect.isStatic = true;
  }
}