
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

    var worldWidth = 1600;
    var worldHeight = 1200;
    this.matter.world.setBounds(0, 0, worldWidth, worldHeight);
        //  Create loads of random bodies
        for (var i = 0; i < 100; i++)
        {
            var x = Phaser.Math.Between(0, worldWidth);
            var y = Phaser.Math.Between(0, worldHeight);
    
            if (Math.random() < 0.7)
            {
                var sides = Phaser.Math.Between(3, 14);
                var radius = Phaser.Math.Between(8, 50);
    
                this.matter.add.polygon(x, y, sides, radius, { restitution: 0.9 });
            }
            else
            {
                var width = Phaser.Math.Between(16, 128);
                var height = Phaser.Math.Between(8, 64);
    
                this.matter.add.rectangle(x, y, width, height, { chamfer:{radius: 10}, restitution: 0.9 });
            }
        }
    
        this.matter.add.mouseSpring();
    
        var cursors = this.input.keyboard.createCursorKeys();
    
        var controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            acceleration: 0.06,
            drag: 0.0005,
            maxSpeed: 1.0
        };
    
        controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
    
        this.input.keyboard.on('KEY_DOWN_Z', function (event) {
    
            this.cameras.main.rotation += 0.01;
    
        }, this);
    
        this.input.keyboard.on('KEY_DOWN_X', function (event) {
    
            this.cameras.main.rotation -= 0.01;
    
        }, this);
    
        var cam = this.cameras.main;
    
        var gui = new dat.GUI();
    
        var p1 = gui.addFolder('Pointer');
        p1.add(this.input, 'x').listen();
        p1.add(this.input, 'y').listen();
        p1.open();
    
        var help = {
            line1: 'Cursors to move',
            line2: 'Q & E to zoom',
            line3: 'Z & X to rotate',
        }
    
        var f1 = gui.addFolder('Camera');
        f1.add(cam, 'x').listen();
        f1.add(cam, 'y').listen();
        f1.add(cam, 'scrollX').listen();
        f1.add(cam, 'scrollY').listen();
        f1.add(cam, 'rotation').min(0).step(0.01).listen();
        f1.add(cam, 'zoom', 0.1, 2).step(0.1).listen();
        f1.add(help, 'line1');
        f1.add(help, 'line2');
        f1.add(help, 'line3');
        f1.open();

    this.terrain.create(this);
  }
 
  public update(time, delta) {
   
    controls.update(delta);
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