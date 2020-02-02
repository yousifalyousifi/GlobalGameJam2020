import * as dat from 'dat.gui';
import * as Phaser from 'phaser';
import { Terrain, HEIGHTMAP_RESOLUTION, HEIGHTMAP_YRESOLUTION, FINISH_FLAG_X_POSITION } from './terrain';
import { BodyType } from 'matter';
import { Truck } from './truck';
import { Vehicles } from './vehicles';
import { TitleScene } from './title';
import { BetweenLevelState } from './gamestate';

const DEBUG = true;


const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

const CAMERA_TRUCK_X_OFFSET = -900;

class ProgressCounter {
  times : number[] = [];
  progress: number[] = [];
  totalTime = 0;
  noteProgress(val: number, interval: number)
  {
    this.progress.push(val);
    this.times.push(interval);
    this.totalTime += interval;
    if (this.totalTime > 1000) {
      let time = this.totalTime;
      let cutoff = 0;
      for (let n = 0; n < this.times.length; n++) {
        time -= this.times[n];
        if (time < 1000) {
          cutoff = n;
          break;
        }
      }
      this.progress.splice(0, cutoff);
      this.times.splice(0, cutoff);
      this.totalTime = 0;
      this.times.forEach( time => this.totalTime += time );
    }
  }
  getAverage() {
    let total = 0;
    for (let n = 0; n < this.progress.length; n++) {
      total += this.progress[n] * this.times[n];
    }
    return total / this.totalTime;
  }
}

export class GameScene extends Phaser.Scene {
  private square: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  private terrain: Terrain = new Terrain();
  private truck: Truck = new Truck();

  private pickupTruck: Vehicles.PickupTruck

  public cursors: Phaser.Types.Input.Keyboard.CursorKeys

  isScrolling:boolean = false;
  totalTime:number;
  startTruckTime:number;
  startTruckX:number;
  truckProgress:ProgressCounter;
  isLosing:boolean;
  isLosingStartTime:number;
  isWinning:boolean;
  isWinningStartTime:number;

  sceneData : BetweenLevelState;
  skyBackground: Phaser.GameObjects.Sprite;
  roadFillContainer: Phaser.GameObjects.Container;
  backgroundContainer: Phaser.GameObjects.Container;
  foregroundContainer: Phaser.GameObjects.Container;
  instructionText: Phaser.GameObjects.Text;
  scoreText: Phaser.GameObjects.Text;
  score: number = 0;

  keySpace: Phaser.Input.Keyboard.Key;
  keyA: Phaser.Input.Keyboard.Key;
  keyD: Phaser.Input.Keyboard.Key;

  music: Phaser.Sound.BaseSound;
  muteButton: Phaser.GameObjects.Sprite;
  
  constructor() {
    super(sceneConfig);
  }

  public init() {
     this.terrain = new Terrain();
     this.truck = new Truck();

     this.totalTime = 0;
     this.startTruckTime = 0;
     this.startTruckX = 0;
     this.truckProgress = new ProgressCounter();
     this.isLosing = false;
     this.isLosingStartTime = 0;
     this.isWinning = false;
     this.isWinningStartTime = 0;

     this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.events.on('shutdown', () => this.stop());

  }

  public preload() {
    
    Vehicles.PickupTruck.preload(this);

    this.sceneData = (<BetweenLevelState>this.scene.settings.data) || new BetweenLevelState();
    if (this.sceneData.startImmediately) {
      this.isScrolling = true;
    } else {
      this.isScrolling = false;
    }

    this.truck.preload(this);
    this.load.image('ground-tiles', '../assets/placeholder/ground_tiles.png');
    this.load.image('sky', '../assets/placeholder/sky.png');
    this.load.image('flag', '../assets/placeholder/finish_flag.png');
    this.load.image('tree1', '../assets/placeholder/kenney_foliagePack_005.png');
    this.load.image('tree2', '../assets/placeholder/kenney_foliagePack_006.png');
    this.load.image('potholetruck', '../assets/placeholder/potholetruck.png');
    this.load.image('music', '../assets/icons/music.png');
    this.load.image('nomusic', '../assets/icons/nomusic.png');
    this.load.image('sound', '../assets/icons/sound.png');
    this.load.image('nosound', '../assets/icons/nosound.png');
    this.load.audio('backgroundMusic', ['../assets/music/Great_Hope_Mono.mp3', '../assets/music/Great_Hope_Mono.ogg']);
    this.load.tilemapTiledJSON('map', '../assets/tiled/level0.json');
  }

  public create() {
    this.matter.add.mouseSpring();

    this.skyBackground = this.add.sprite(0, 0, 'sky').setOrigin(0, 0).setScrollFactor(0);

    if (!this.sceneData.startImmediately) {
      const scrollButton = this.add.text(100, 50, 'Go!', { fontSize: '30px' })
      .setInteractive();

      scrollButton.on('pointerdown', () => {
        this.isScrolling = true;
        scrollButton.setVisible(false);
      });
    }

    this.instructionText = this.add.text(440, 150, 'Use ←/→ cursor keys to move\nUse A and D to fill potholes', { fontSize: '30px', align: 'center', color: 'black', fontFamily: 'sans-serif'})
      .setScrollFactor(0);
    // const roadFillButton = this.add.text(1100, 50, 'Fill', { fontSize: '30px' })
    //   .setInteractive()
    //   .setScrollFactor(0);
    // roadFillButton.on('pointerdown', () => this.fillRoad());

    this.scoreText = this.add.text(140, 150, 'Damage: 0 / 5', { fontSize: '30px', align: 'center', color: 'red', fontFamily: 'sans-serif'})
      .setScrollFactor(0);

    this.input.keyboard.addKey('SPACE')
    this.keySpace
      .on('down', () => this.fillRoad());
      
    this.keyA
    .on('down', () => this.fillRoad(-190));
    
    this.keyD
      .on('down', () => this.fillRoad(210));

    this.roadFillContainer = this.add.container(0, 0);
    this.backgroundContainer = this.add.container(0, 0);

    this.truck.createTruck(this, {x:900, y: 300});

    this.pickupTruck = new Vehicles.PickupTruck(this);
    this.events.on('barrelDrop', function() {
      this.score++
      this.scoreText.setText('Damage: ' + this.score + ' / 5')
      if(this.score >= 5) {
        this.startLose()
      }
    }, this)

    this.cursors = this.input.keyboard.createCursorKeys();

    this.foregroundContainer = this.add.container(0, 0);
    this.terrain.create(this, this.sceneData.level, this.backgroundContainer, this.foregroundContainer);

    let mute = this.sound.mute;
    this.sound.volume = 0.5;
    if (DEBUG) {
      mute = true;
      this.sound.mute = mute;
    }
    this.muteButton = this.add.sprite(640 - 8, 30, mute ? 'nomusic' : 'music')
      .setInteractive()
      .setScrollFactor(0);
    this.muteButton.setTexture(mute ? 'nomusic' : 'music');
    this.muteButton.on('pointerdown', () => {
      let nextMute = !this.sound.mute;
      this.sound.mute = nextMute;
      this.muteButton.setTexture(nextMute ? 'nomusic' : 'music');
    });

    this.music = this.sound.add('backgroundMusic', {loop: true});
    this.music.play();

  }

  public stop() {
    this.keySpace.off('down');
    this.keyA.off('down');
    this.keyD.off('down');
    this.input.keyboard.removeKey(this.keySpace);
    this.input.keyboard.removeKey(this.keyA);
    this.input.keyboard.removeKey(this.keyD);
    this.events.off('shutdown');
  }

  startLose() {
    if (this.isLosing) return;
    this.isLosing = true;
    this.isLosingStartTime = this.totalTime;
    this.add.text(440, 150, 'You lose', { fontSize: '90px', align: 'center', color: 'black', fontFamily: 'sans-serif'})
      .setScrollFactor(0);
  }

  startWin() {
    if (this.isWinning) return;
    this.isWinning = true;
    this.isWinningStartTime = this.totalTime;
    this.add.text(440, 150, 'You win!', { fontSize: '90px', align: 'center', color: 'black', fontFamily: 'sans-serif'})
      .setScrollFactor(0);
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
    this.totalTime += delta;

    this.truck.applyRumble();
    if (this.cursors.left.isDown) {
      this.truck.applyDrivingForce(0.018, -1);
    } else if (this.cursors.right.isDown) {
      this.truck.applyDrivingForce(0.018, 1);
    }

    this.cameras.main.scrollX = this.truck.chasis.x + CAMERA_TRUCK_X_OFFSET;
    if (this.cameras.main.scrollX < 0) this.cameras.main.scrollX = 0;

    if (this.isScrolling && !this.isLosing) {
  
      if (this.totalTime > 2000)
      {
        this.instructionText.visible = false;
        if (this.startTruckTime == 0) {
          this.startTruckTime = this.totalTime;
          this.startTruckX = this.pickupTruck.chasis.x;
        }

        this.pickupTruck.applyDrivingForce(0.005, 1);
        this.pickupTruck.updateBarrels()
        if(this.pickupTruck.chasis.body.velocity.x < 0.5) {//Increase force if vehicle is slight stuck
          this.pickupTruck.applyDrivingForce(0.04, 1);
        }
        this.truckProgress.noteProgress((this.pickupTruck.chasis.x - this.startTruckX) / delta, delta);
        this.startTruckX = this.pickupTruck.chasis.x;

        if(this.pickupTruck.chasis.x > FINISH_FLAG_X_POSITION + 220) {
          this.startWin()
        }

        // Check if enough forward progress has happened
        if (this.totalTime > 1000 + this.startTruckTime) {
          if (this.truckProgress.getAverage() < 0.001) {
            this.startLose();
          }
        }
      }
    }

    // Show the "You lose" text for three seconds and then go back to the title screen
    if (this.isLosing && this.totalTime - this.isLosingStartTime > 3000) {
      this.scene.start(DEBUG ? 'Game' : 'Title');
    }
    if (this.isWinning && this.totalTime - this.isWinningStartTime > 3000) {
      this.scene.start('Title');
    }

  }
}


const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Global Game Jam 2020',

  scene: DEBUG ? [GameScene] : [TitleScene, GameScene],

  type: Phaser.AUTO,

  scale: {
    width: 1280,
    height: 720,
  },

  physics: {
    default: 'matter',

    matter: DEBUG ? {
      debug: {
        showAxes: true,
        showAngleIndicator: true,
        showCollisions: true
      },
    } : {},
  },

  parent: 'game',
  backgroundColor: '#000000',
};

export const game = new Phaser.Game(gameConfig);