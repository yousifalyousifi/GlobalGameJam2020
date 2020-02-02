import * as Phaser from 'phaser';

const V2 = Phaser.Math.Vector2;

export class Truck {

    public chasis: any;
    public wheelA: any;
    public wheelB: any;

    preload(scene: Phaser.Scene) {
        scene.load.image('truckbody', 'assets/placeholder/truck_body.png');
        scene.load.image('wheel', 'assets/placeholder/truck_wheel.png');
    }

    createTruck(scene: Phaser.Scene, position?: Phaser.Types.Math.Vector2Like) {

        var truckGroup = scene.matter.world.nextGroup(true);

        this.chasis = scene.matter.add.image(position.x, position.y, 'truckbody');
        this.chasis.setRectangle(300, 100, {
            mass: 30,
            restitution: 0.9,
            friction: 0.4,
            isStatic: false,
            collisionFilter: {
                group: truckGroup
            }
        });
        this.chasis.scale = 0.3

        this.wheelA = scene.matter.add.image(position.x+100, position.y+100, 'wheel');
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


        this.wheelB = scene.matter.add.image(position.x-100, position.y+100, 'wheel');
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

        scene.matter.add.constraint(this.wheelA, this.chasis, 40, 0.08, {
            pointB: { x: 90, y: 50 }
        });
        scene.matter.add.constraint(this.wheelA, this.chasis, 40, 0.08, {
            pointB: { x: 130, y: 50 }
        });
        scene.matter.add.constraint(this.wheelB, this.chasis, 40, 0.08, {
            pointB: { x: -70, y: 50 }
        });
        scene.matter.add.constraint(this.wheelB, this.chasis, 40, 0.08, {
            pointB: { x: -110, y: 50 }
        });

        return this;
    }

    applyRumble() {
        let vec = new V2(0, Phaser.Math.RND.frac() * 0.1001);
        // Phaser.Math.RandomXY(vec, Phaser.Math.RND.frac()*0.1001);
        this.chasis.applyForceFrom(new V2(this.chasis.x, this.chasis.y), vec);
    }

    /**
     * 
     * @param magnitude 
     * @param direction +1 or -1
     */
    applyDrivingForce(magnitude: number, direction: number) {

        magnitude = magnitude || 0.009;

        this.wheelA.applyForceFrom(new V2(this.wheelA.x, this.wheelA.y - 30), new V2(direction * magnitude, 0));
        this.wheelB.applyForceFrom(new V2(this.wheelB.x, this.wheelB.y - 30), new V2(direction * magnitude, 0));
        // this.chasis.applyForceFrom(new V2(this.chasis.x, this.chasis.y-30), new V2(direction*magnitude,0));

    }


}