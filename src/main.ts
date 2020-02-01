
import * as dat from 'dat.gui';
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