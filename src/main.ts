import * as dat from 'dat.gui';
import * as Phaser from 'phaser';
import { Terrain } from './terrain';


const V2 = Phaser.Math.Vector2;


const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Phaser.Scene {
  private square: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  private terrain: Terrain = new Terrain();
  
  public cursors: Phaser.Types.Input.Keyboard.CursorKeys
  public ball: Phaser.Physics.Matter.Image;

  constructor() {
    super(sceneConfig);
  }
 
  public preload() {
    this.load.image("ground-tiles", "../assets/tilesets/ground.png");
    this.load.image('ball', 'assets/redstone.png');
    this.load.image('box', 'assets/button-line.png');
  }

  public create() {

    var worldWidth = 800;
    var worldHeight = 600;
    this.matter.world.setBounds(0, 0, worldWidth, worldHeight);

    this.matter.add.mouseSpring();


    // add stiff multi-body constraint
    var carBody = this.matter.bodies.rectangle(300, 300, 100, 20, { chamfer:{radius: 10}, restitution: 0.7 });
    var wheelA = this.matter.bodies.circle(100, 300, 20);
    var wheelB = this.matter.bodies.circle(200, 300, 20);

    // var car = this.matter.composites.car(300,400,300,10,20);
    // this.matter.world.add(car);

    var constraint: MatterJS.ConstraintType;
    constraint = this.matter.constraint.create({
        bodyA: wheelA,
        pointA: { x: 0, y: 0 },
        bodyB: carBody,
        pointB: { x: 10, y: 0 }
    });
    // this.matter.world.add([wheelA, carBody, wheelB]);
    
    // constraint = this.matter.constraint.create({
    //     bodyA: wheelB,
    //     pointA: { x: 0, y: 0 },
    //     bodyB: carBody,
    //     pointB: { x: -10, y: 0 }
    // });
    // this.matter.world.add([wheelB, carBody, constraint]);

    
    var floor = this.matter.add.rectangle(400, 500, 600, 20, {friction: 0.1, restitution: 0.3, isStatic: true, angle: 0.1 });

    this.ball = this.matter.add.image(300, 300, 'ball', null);
    this.ball.setCircle(20, {
      mass: 1,
      restitution: 0.9,
      friction: 0.1,
      isStatic: false
    });
    // this.ball.applyForceFrom(new V2(this.ball.x, this.ball.y), new V2(0,-0.1));

    // this.terrain.create(this);
    this.cursors = this.input.keyboard.createCursorKeys();
  }
 
  public update(time, delta) {
   
    if (this.cursors.left.isDown)
    {
      this.ball.applyForceFrom(new V2(this.ball.x, this.ball.y-30), new V2(-0.001,0));
    }
    else if (this.cursors.right.isDown)
    {
      this.ball.applyForceFrom(new V2(this.ball.x, this.ball.y-30), new V2(0.001,0));
    }

    if (this.cursors.up.isDown)
    {
      this.ball.applyForce(new V2(0,-0.01));
    }
    else if (this.cursors.down.isDown)
    {
      this.ball.thrust(0.01);
    }
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