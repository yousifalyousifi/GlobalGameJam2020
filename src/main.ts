import * as Phaser from 'phaser';
import { Terrain } from './terrain';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Phaser.Scene {
  private square: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  private terrain: Terrain = new Terrain();

  constructor() {
    super(sceneConfig);
  }
 
  public preload() {
    this.load.image("ground-tiles", "../assets/tilesets/ground.png");
  }

  public create() {
    this.square = this.add.rectangle(400, 400, 100, 100, 0xFFFFFF) as any;
    this.physics.add.existing(this.square);
    this.terrain.create(this);
  }
 
  public update() {
    // TODO
  }
}

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',

  scene: GameScene,
 
  type: Phaser.AUTO,
 
  scale: {
    width: 1280,
    height: 720,
  },
 
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
    },
  },
 
  parent: 'game',
  backgroundColor: '#000000',
};
 
export const game = new Phaser.Game(gameConfig);