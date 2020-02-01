
import * as dat from 'dat.gui';
import * as Phaser from 'phaser';
import { Terrain } from './terrain';


const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

var controls;
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

    var worldWidth = 600;
    var worldHeight = 600;
    this.matter.world.setBounds(0, 0, worldWidth, worldHeight);
    this.matter.add.rectangle(300,300, 100, 20, { chamfer:{radius: 10}, restitution: 0.7 });

    this.matter.add.circle(300,200, 20, {restitution: 0.7 });
    this.matter.add.circle(300,100, 20, {restitution: 0.7 });
    this.matter.add.mouseSpring();


    // add stiff multi-body constraint
    var bodyA = this.matter.bodies.polygon(100, 400, 60, 20);
    var bodyB = this.matter.bodies.polygon(200, 400, 1, 50);

    var constraint = this.matter.constraint.create({
        bodyA: bodyA,
        pointA: { x: 0, y: 0 },
        bodyB: bodyB,
        pointB: { x: 0, y: 0 }
    });
    this.matter.world.add([bodyA, bodyB, constraint]);

    
    this.terrain.create(this);
  }
 
  public update(time, delta) {
   
  }
}

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Global Game Jam 2020',

  scene: GameScene,
 
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