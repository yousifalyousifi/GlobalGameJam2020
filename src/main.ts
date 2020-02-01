import * as dat from 'dat.gui';
import * as Phaser from 'phaser';
import { Terrain } from './terrain';
import { isMainThread } from 'worker_threads';


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
  car: any;

  isScrolling = false;
  skyBackground: Phaser.GameObjects.Sprite;

  constructor() {
    super(sceneConfig);
  }
 
  public preload() {
    this.load.image('ball', 'assets/placeholder/truck_wheel.png');
    this.load.image('wheel', 'assets/placeholder/truck_wheel.png');
    this.load.image('box', 'assets/button-line.png');

    this.load.image("ground-tiles", "../assets/placeholder/ground_tiles.png");
    this.load.image("sky", "../assets/placeholder/sky.png");
    this.load.image("tree1", "../assets/placeholder/kenney_foliagePack_005.png");
  }

  public create() {
    this.skyBackground = this.add.sprite(0, 0, "sky").setOrigin(0, 0);
    const scrollButton = this.add.text(100, 100, 'Go!', {fontSize: '30px'})
      .setInteractive();
    scrollButton.on('pointerdown', () => {
      this.isScrolling = true; 
      scrollButton.setVisible(false); });
    this.add.sprite(640, 720 - (207 / 2) - 192, "tree1");
    this.add.sprite(2000, 720 - (207 / 2) - 192, "tree1");
    this.add.sprite(1800, 720 - (207 / 2) - 192, "tree1");

    var worldWidth = 800;
    var worldHeight = 600;
    this.matter.world.setBounds(0, 0, worldWidth, worldHeight);

    this.matter.add.mouseSpring();

    var floor = this.matter.add.rectangle(400, 500, 600, 20, {friction: 0.1, restitution: 0.3, isStatic: true, angle: 0.1 });

    this.ball = this.matter.add.image(100, 300, 'ball', null);
    this.ball.setCircle(20, {
      mass: 1,
      restitution: 0.9,
      friction: 0.1,
      isStatic: false
    });
    // this.ball.applyForceFrom(new V2(this.ball.x, this.ball.y), new V2(0,-0.1));

    this.car = createCar(this.matter, 300,100,300,100,30)
    this.matter.world.add(this.car.car);

    //
    //
    //
    //
    //
    //


    var wheelA = this.matter.add.image(150, 0, 'wheel');
    wheelA.setCircle(50, {
      mass: 1,
      restitution: 0.9,
      friction: 0.1,
      isStatic: false
    });

    var wheelB = this.matter.add.image(150, 0, 'wheel');
    wheelB.setCircle(50, {
      mass: 1,
      restitution: 0.9,
      friction: 0.1,
      isStatic: false
    });
    
    var axelB = this.matter.add.constraint(
      wheelA.body,
      wheelB.body,
      100,
      1
    );     

    // this.terrain.create(this);
    this.cursors = this.input.keyboard.createCursorKeys();

    
    console.log(this.ball.applyForce)
    console.log(this.car.car)
  }
 
  public update(time, delta) {


    if (this.cursors.left.isDown)
    {
      this.car.applyForceFrom(new V2(this.car.wheelA.x, this.car.wheelA.y-30), new V2(-0.0005,0));
    }
    else if (this.cursors.right.isDown)
    {
      this.car.car.applyForceFrom(new V2(this.car.wheelA.x, this.car.wheelA.y-30), new V2(0.0005,0));
    }

    if (this.cursors.up.isDown)
    {
      this.ball.applyForce(new V2(0,-0.0019));
    }
    else if (this.cursors.down.isDown)
    {
      this.ball.applyForce(new V2(0,0.0019));
    }

    if (this.isScrolling) {
      this.cameras.main.scrollX += 0.2 * delta;
      this.skyBackground.setPosition(this.cameras.main.scrollX, 0);
    }
  }
}

function createCar(matter: Phaser.Physics.Matter.MatterPhysics, xx, yy, width, height, wheelSize) {
   
     var group = matter.world.nextGroup(true);
     var wheelBase = 50;
     var wheelAOffset = -width * 0.5 + wheelBase;
     var wheelBOffset = width * 0.5 - wheelBase;
     var wheelYOffset = 50;
     var wheelSeparation = wheelBOffset - wheelAOffset;
 
      var body = matter.bodies.rectangle(xx, yy, width, height, { 
             collisionFilter: {
                 group: group,
                 category: 1,
                 mask: 1
             },
             chamfer: {
                 radius: 1//height * 0.5
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
             

     return {car: car, wheelA: wheelA, wheelB: wheelB};
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