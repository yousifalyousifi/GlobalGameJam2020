
import * as dat from 'dat.gui';
import * as Phaser from 'phaser';
import { Terrain, HEIGHTMAP_RESOLUTION, HEIGHTMAP_YRESOLUTION } from './terrain';
import { TitleScene } from './title';
import { BetweenLevelState } from './gamestate';


const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

const CAMERA_TRUCK_X_OFFSET = -900;

export class GameScene extends Phaser.Scene {
  private square: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  private terrain: Terrain = new Terrain();
  isScrolling = false;
  skyBackground: Phaser.GameObjects.Sprite;
  potHoleTruckSprite: Phaser.GameObjects.Sprite;
  roadFillContainer: Phaser.GameObjects.Container;

  constructor() {
    super(sceneConfig);
  }
 
  public preload() {
    this.load.image('ground-tiles', '../assets/placeholder/ground_tiles.png');
    this.load.image('sky', '../assets/placeholder/sky.png');
    this.load.image('tree1', '../assets/placeholder/kenney_foliagePack_005.png');
    this.load.image('potholetruck', '../assets/placeholder/potholetruck.png');
  }

  public create() {
    this.skyBackground = this.add.sprite(0, 0, 'sky').setOrigin(0, 0);
    const scrollButton = this.add.text(100, 50, 'Go!', {fontSize: '30px'})
      .setInteractive();
    scrollButton.on('pointerdown', () => {
      this.isScrolling = true; 
      scrollButton.setVisible(false); });
    const roadFillButton = this.add.text(1100, 50, 'Fill', {fontSize: '30px'})
      .setInteractive();
    roadFillButton.on('pointerdown', () => this.fillRoad());
    this.input.keyboard.addKey('SPACE')
      .on('down', () => this.fillRoad());
    this.add.sprite(640, 720 - (207 / 2) - 192, "tree1");
    this.add.sprite(2000, 720 - (207 / 2) - 192, "tree1");
    this.add.sprite(1800, 720 - (207 / 2) - 192, "tree1");
    this.roadFillContainer = this.add.container(0, 0);

    var worldWidth = 600;
    var worldHeight = 600;
    this.matter.world.setBounds(0, 0, worldWidth, worldHeight);

    this.matter.add.mouseSpring();


    // add stiff multi-body constraint
    var carBody = this.matter.bodies.rectangle(300, 100, 100, 20, { chamfer:{radius: 10}, restitution: 0.7 });
    var wheelA = this.matter.bodies.circle(100, 300, 20);
    var wheelB = this.matter.bodies.circle(200, 300, 20);

    var car = this.matter.composites.car(300,300,300,10,20);
    this.matter.world.add(car);

    var constraint: MatterJS.ConstraintType;
    constraint = this.matter.constraint.create({
        bodyA: wheelA,
        pointA: { x: 0, y: 0 },
        bodyB: carBody,
        pointB: { x: 10, y: 0 }
    });
    this.matter.world.add([wheelA, carBody, wheelB]);

    // constraint = this.matter.constraint.create({
    //     bodyA: wheelB,
    //     pointA: { x: 0, y: 0 },
    //     bodyB: carBody,
    //     pointB: { x: -10, y: 0 }
    // });
    // this.matter.world.add([wheelB, carBody, constraint]);

    let sceneData = (<BetweenLevelState>this.scene.settings.data) || new BetweenLevelState();
    const level = sceneData.level;
    this.terrain.create(this, level);
    this.potHoleTruckSprite = this.add.sprite(-CAMERA_TRUCK_X_OFFSET, 720 - (212 / 2) - 192, 'potholetruck');
  }
 
  fillRoad() {
    const fillHeights = [1, 1, 2, 3, 4, 4, 5, 5, 4, 4, 3, 2, 1, 1];
    const fillX = this.potHoleTruckSprite.x - 85 - (fillHeights.length / 2 * HEIGHTMAP_RESOLUTION);
    const fillHeightMapX = Math.floor(fillX / HEIGHTMAP_RESOLUTION);
    // Draw in the road fill
    const yOffset = 720 - 192;
    const FILL_HEIGHT = 64;
    for (let fillHeightX = 0; fillHeightX < fillHeights.length; fillHeightX++) {
      this.roadFillContainer.add(this.add.rectangle(
        (fillHeightMapX + fillHeightX) * HEIGHTMAP_RESOLUTION + HEIGHTMAP_RESOLUTION  / 2,
        yOffset + (this.terrain.heightMap[fillHeightMapX + fillHeightX] - fillHeights[fillHeightX])* HEIGHTMAP_YRESOLUTION + FILL_HEIGHT / 2,
        HEIGHTMAP_RESOLUTION,
        FILL_HEIGHT, 
        0x555555));
    }
    // Adjust the height map and the physics
    for (let fillHeightX = 0; fillHeightX < fillHeights.length; fillHeightX++) {
      this.terrain.heightMap[fillHeightMapX + fillHeightX] -= fillHeights[fillHeightX];
      // Will this cause problems to have overlapping physics objects this way?
      this.terrain.createPhysicsRectangleForHeightMap(fillHeightMapX + fillHeightX, fillHeightMapX + fillHeightX + 1, yOffset, this);
    }
  }

  public update(time, delta) {
    if (this.isScrolling) {
      this.potHoleTruckSprite.x += 0.2 * delta;
      this.cameras.main.scrollX = this.potHoleTruckSprite.x + CAMERA_TRUCK_X_OFFSET;
      this.skyBackground.setPosition(this.cameras.main.scrollX, 0);
    }
  }
}


const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Global Game Jam 2020',

  scene: [GameScene],
  //  scene: [TitleScene, GameScene],
 
  type: Phaser.AUTO,
 
  scale: {
    width: 1280,
    height: 720,
  },
 
  physics: {
    default: 'matter',
    matter: {
      debug: true,
    },
  },
 
  parent: 'game',
  backgroundColor: '#000000',
};
 
export const game = new Phaser.Game(gameConfig);