import * as dat from 'dat.gui';
import * as Phaser from 'phaser';
import { Terrain, HEIGHTMAP_RESOLUTION, HEIGHTMAP_YRESOLUTION } from './terrain';
import { isMainThread } from 'worker_threads';
import { BodyType } from 'matter';
import { Truck } from './truck';
import { Vehicles, Vehicle } from './vehicles';
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
  private truck = new Truck();
  
  vehicle = new Vehicles()

  public cursors: Phaser.Types.Input.Keyboard.CursorKeys

  isScrolling = false;
  sceneData : BetweenLevelState;
  skyBackground: Phaser.GameObjects.Sprite;
  roadFillContainer: Phaser.GameObjects.Container;
  backgroundContainer: Phaser.GameObjects.Container;
  foregroundContainer: Phaser.GameObjects.Container;

  constructor() {
    super(sceneConfig);
  }

  public preload() {
    
    new Vehicles().preload(this);

    this.sceneData = (<BetweenLevelState>this.scene.settings.data) || new BetweenLevelState();
    if (this.sceneData.startImmediately) {
      this.isScrolling = true;
    } else {
      this.isScrolling = false;
    }

    this.truck.preload(this);
    this.load.image('ground-tiles', '../assets/placeholder/ground_tiles.png');
    this.load.image('sky', '../assets/placeholder/sky.png');
    this.load.image('tree1', '../assets/placeholder/kenney_foliagePack_005.png');
    this.load.image('tree2', '../assets/placeholder/kenney_foliagePack_006.png');
    this.load.image('potholetruck', '../assets/placeholder/potholetruck.png');
    this.load.tilemapTiledJSON('map', '../assets/tiled/level0.json');
  }

  public create() {
    
    this.matter.add.mouseSpring();

    this.skyBackground = this.add.sprite(0, 0, 'sky').setOrigin(0, 0);

    if (!this.sceneData.startImmediately) {
      const scrollButton = this.add.text(100, 50, 'Go!', { fontSize: '30px' })
      .setInteractive();

      scrollButton.on('pointerdown', () => {
        this.isScrolling = true;
        scrollButton.setVisible(false);
      });
    }

    const roadFillButton = this.add.text(1100, 50, 'Fill', { fontSize: '30px' })
      .setInteractive();
    roadFillButton.on('pointerdown', () => this.fillRoad());

    this.input.keyboard.addKey('SPACE')
      .on('down', () => this.fillRoad());
      
    this.input.keyboard.addKey('A')
    .on('down', () => this.fillRoad(-190));
    
    this.input.keyboard.addKey('D')
      .on('down', () => this.fillRoad(200));

    this.roadFillContainer = this.add.container(0, 0);
    this.backgroundContainer = this.add.container(0, 0);

    this.truck.createTruck(this, {x:900, y: 300});

    this.vehicle = new Vehicles();
    this.vehicle.createVehicle(this);


    this.cursors = this.input.keyboard.createCursorKeys();

    this.foregroundContainer = this.add.container(0, 0);
    this.terrain.create(this, this.sceneData.level, this.backgroundContainer, this.foregroundContainer);
  }

  fillRoad(offset?: number) {
    offset = offset || -145
    const fillHeights = [1, 1, 2, 3, 3, 3, 4, 4, 3, 3, 3, 2, 1, 1];
    const fillX = this.truck.chasis.x + offset - (fillHeights.length / 2 * HEIGHTMAP_RESOLUTION);
    const fillHeightMapX = Math.floor(fillX / HEIGHTMAP_RESOLUTION);
    // Draw in the road fill
    const yOffset = 720 - 192;
    const FILL_HEIGHT = 64;
    for (let fillHeightX = 0; fillHeightX < fillHeights.length; fillHeightX++) {
      this.roadFillContainer.add(this.add.rectangle(
        (fillHeightMapX + fillHeightX) * HEIGHTMAP_RESOLUTION + HEIGHTMAP_RESOLUTION / 2,
        yOffset + (this.terrain.heightMap[fillHeightMapX + fillHeightX] - fillHeights[fillHeightX]) * HEIGHTMAP_YRESOLUTION + FILL_HEIGHT / 2,
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

    this.vehicle.applyDrivingForce(0.005, 1);
    console.log(this.vehicle.chasis.body.velocity)
    if(this.vehicle.chasis.body.velocity.x < 0.5) {
      this.vehicle.applyDrivingForce(0.01, 1);
    }

    this.truck.applyRumble();
    if (this.cursors.left.isDown) {
      this.truck.applyDrivingForce(0.018, -1);
    } else if (this.cursors.right.isDown) {
      this.truck.applyDrivingForce(0.018, 1);
    }

    if (this.isScrolling) {
      this.cameras.main.scrollX = this.truck.chasis.x + CAMERA_TRUCK_X_OFFSET;
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
      debug: {
        showAxes: true,
        showAngleIndicator: true,
        showCollisions: true
      },
    },
  },

  parent: 'game',
  backgroundColor: '#000000',
};

export const game = new Phaser.Game(gameConfig);