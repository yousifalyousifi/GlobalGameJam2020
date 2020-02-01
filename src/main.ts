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

    var floor = this.matter.add.rectangle(400, 500, 600, 20, {friction: 0.1, restitution: 0.3, isStatic: true, angle: 0.1 });
    this.ball = this.matter.add.image(300, 300, 'ball', null);
    this.ball.setCircle(20, {
      mass: 1,
      restitution: 0.9,
      friction: 0.1,
      isStatic: false
    });
    // this.ball.applyForceFrom(new V2(this.ball.x, this.ball.y), new V2(0,-0.1));

    var car = createCar(this.matter, 200,100,300,100,30)
    this.matter.world.add(car);

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

function createCar(matter: Phaser.Physics.Matter.MatterPhysics, xx, yy, width, height, wheelSize) {
   
     var group = matter.world.nextGroup(true);
     var wheelBase = 50;
     var wheelAOffset = -width * 0.5 + wheelBase;
     var wheelBOffset = width * 0.5 - wheelBase;
     var wheelYOffset = 50;
 
      var body = matter.bodies.rectangle(xx, yy, width, height, { 
             collisionFilter: {
                 group: group,
                 category: 1,
                 mask: 1
             },
             chamfer: {
                 radius: height * 0.5
             },
             density: 0.0002
         });
 
     var wheelA = matter.bodies.circle(xx + wheelAOffset, yy + wheelYOffset, wheelSize, { 
         collisionFilter: {
             group: group,
             category: 1,
             mask: 1
         },
         friction: 0.8
     });
                 
     var wheelB = matter.bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, { 
         collisionFilter: {
             group: group,
             category: 1,
             mask: 1
         },
         friction: 0.8
     });

     var axelA = matter.constraint.create({
        bodyB: body,
        pointB: { x: wheelAOffset, y: wheelYOffset },
        bodyA: wheelA,
        stiffness: 1,
        length: 0
    });
                  
  var axelB = matter.constraint.create({
      bodyB: body,
      pointB: { x: wheelBOffset, y: wheelYOffset },
      bodyA: wheelB,
      stiffness: 1,
      length: 0
  });

     var car = matter.composite.create({
       label: "car",
       bodies: [body, wheelA, wheelB],
       constraints: [axelA, axelB]
     })
                 


     return car;
 };


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