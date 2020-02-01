import * as dat from 'dat.gui';
import * as Phaser from 'phaser';
import { Terrain, HEIGHTMAP_RESOLUTION, HEIGHTMAP_YRESOLUTION } from './terrain';
import { isMainThread } from 'worker_threads';
import { BodyType } from 'matter';


const V2 = Phaser.Math.Vector2;


const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

const CAMERA_TRUCK_X_OFFSET = -900;

export class GameScene extends Phaser.Scene {
  private square: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  private terrain: Terrain = new Terrain();
  
  public cursors: Phaser.Types.Input.Keyboard.CursorKeys
  public ball: Phaser.Physics.Matter.Image;
  truck: Phaser.Physics.Matter.Image;
  wheelA: Phaser.Physics.Matter.Image
  wheelB: Phaser.Physics.Matter.Image

  isScrolling = false;
  skyBackground: Phaser.GameObjects.Sprite;
  potHoleTruckSprite: Phaser.GameObjects.Sprite;
  roadFillContainer: Phaser.GameObjects.Container;

  constructor() {
    super(sceneConfig);
  }
 
  public preload() {
    this.load.image('truckbody', 'assets/placeholder/truck_body.png');
    this.load.image('wheel', 'assets/placeholder/truck_wheel.png');
    this.load.image('box', 'assets/button-line.png');
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


    this.matter.add.mouseSpring();

    // this.ball = this.matter.add.image(100, 300, 'ball', null);
    // this.ball.setCircle(20, {
    //   mass: 1,
    //   restitution: 0.9,
    //   friction: 0.1,
    //   isStatic: false
    // });
    // this.ball.applyForceFrom(new V2(this.ball.x, this.ball.y), new V2(0,-0.1));

    // this.car = createCar(this.matter, 500,100,300,100,30)
    // this.matter.world.add(this.car.car);

    //
    //
    //
    //
    //
    //

    var truckGroup = this.matter.world.nextGroup(true);

    this.truck = this.matter.add.image(150, 0, 'truckbody');
    this.truck.setRectangle(300,100, {
      mass: 30,
      restitution: 0.9,
      friction: 0.4,
      isStatic: false,
      collisionFilter: {
        group: truckGroup
      }
    });
    this.truck.scale = 0.3

    this.wheelA = this.matter.add.image(250, 100, 'wheel');
    this.wheelA.setCircle(30, {
      mass: 30,
      restitution: 0.9,
      friction: 0.4,
      isStatic: false,
      collisionFilter: {
        group: truckGroup
      }
    });
    this.wheelA.scale = 0.6

    this.wheelB = this.matter.add.image(50, 100, 'wheel');
    this.wheelB.setCircle(30, {
      mass: 30,
      restitution: 0.9,
      friction: 0.4,
      isStatic: false,
      collisionFilter: {
        group: truckGroup
      }
    });
    this.wheelB.scale = 0.6

    // this.matter.add.constraint(this.wheelA.body, this.wheelB.body, 220, 0.2);
    
    
    this.matter.add.constraint(this.wheelA, this.truck, 40, 0.3, {
      pointB: {x: 90, y: 50}
    });
    this.matter.add.constraint(this.wheelA, this.truck.body, 40, 0.3, {
      pointB: {x: 130, y: 50}
    });

    this.matter.add.constraint(this.wheelB, this.truck.body, 40, 0.3, {
      pointB: {x: -70, y: 50}
    });
    this.matter.add.constraint(this.wheelB, this.truck.body, 40, 0.3, {
      pointB: {x: -110, y: 50}
    });
    // this.matter.add.constraint(this.wheelA.body, this.truck.body, 220, 0.2);

    // this.terrain.create(this);
    this.cursors = this.input.keyboard.createCursorKeys();

    
    // console.log(this.ball.applyForce)
    this.terrain.create(this);
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

    var wheelTurnForce = 0.009;

    if (this.cursors.left.isDown)
    {
      this.wheelA.applyForceFrom(new V2(this.wheelA.x, this.wheelA.y-30), new V2(-1*wheelTurnForce,0));
      this.wheelB.applyForceFrom(new V2(this.wheelB.x, this.wheelB.y-30), new V2(-1*wheelTurnForce,0));
    }
    else if (this.cursors.right.isDown)
    {
      this.wheelA.applyForceFrom(new V2(this.wheelA.x, this.wheelA.y-30), new V2(wheelTurnForce,0));
      this.wheelB.applyForceFrom(new V2(this.wheelB.x, this.wheelB.y-30), new V2(wheelTurnForce,0));
    }

    // if (this.cursors.up.isDown)
    // {
    //   this.ball.applyForce(new V2(0,-0.0019));
    // }
    // else if (this.cursors.down.isDown)
    // {
    //   this.ball.applyForce(new V2(0,0.0019));
    // }

    if (this.isScrolling) {
      this.potHoleTruckSprite.x += 0.2 * delta;
      this.cameras.main.scrollX = this.potHoleTruckSprite.x + CAMERA_TRUCK_X_OFFSET;
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