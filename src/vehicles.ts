import * as Phaser from 'phaser';

const V2 = Phaser.Math.Vector2;

export class Vehicle {




}

export class Vehicles {

    chasis
    wheelA
    wheelB

    preload(scene: Phaser.Scene) {
        scene.load.image('generic_wheel', '../assets/placeholder/generic_wheel.png');
        scene.load.image('pickup_chasis', '../assets/placeholder/pickup_chasis.png');
        scene.load.image('spr_car4_0', '../assets/placeholder/spr_car4_0.png');
        scene.load.image('spr_casualcar_0', '../assets/placeholder/spr_casualcar_0.png');
        scene.load.image('spr_estatecar_0', '../assets/placeholder/spr_estatecar_0.png');
        scene.load.image('spr_van_0', '../assets/placeholder/spr_van_0.png');
    }


    createVehicle(scene: Phaser.Scene) {

        let pos = {x:400, y:450};
        let isStatic = false;

        let offsetA = {x: pos.x+140, y: pos.y+50}
        let offsetB = {x: pos.x-90, y: pos.y+50}

        var rectA = scene.matter.bodies.rectangle(pos.x+0, pos.y+10, 300, 35);
        var rectB = scene.matter.bodies.rectangle(pos.x+100, pos.y-40, 100, 60);
        var rectC = scene.matter.bodies.rectangle(pos.x-140, pos.y-15, 15,15);

        var compoundBody = scene.matter.body.create({
            parts: [rectA, rectB, rectC]
        });

        var vehicleGroup = scene.matter.world.nextGroup(true);

        let chasis = scene.matter.add.image(150, 0, 'pickup_chasis');

        chasis.setExistingBody(compoundBody);
        chasis.setCollisionGroup(vehicleGroup);
        chasis.setBounce(0.0)
        chasis.setOrigin(0.6,0.7)
        chasis.setStatic(isStatic);
        chasis.scale = 0.6

        let wheelA = scene.matter.add.image(offsetA.x, offsetA.y, 'generic_wheel');
        wheelA.setCircle(30, {
            mass: 30,
            restitution: 0.9,
            friction: 0.4,
            isStatic: isStatic,
            collisionFilter: {
                group: vehicleGroup
            }
        });
        wheelA.scale = 0.6


        let wheelB = scene.matter.add.image(offsetB.x, offsetB.y, 'generic_wheel');
        wheelB.setCircle(30, {
            mass: 30,
            restitution: 0.9,
            friction: 0.4,
            isStatic: isStatic,
            collisionFilter: {
                group: vehicleGroup
            }
        });
        wheelB.scale = 0.6

        scene.matter.add.constraint(<any>wheelA, <any>chasis, 70, 0.08, {
            pointB: { x: 50, y: 0 }
        });
        scene.matter.add.constraint(<any>wheelA, <any>chasis, 70, 0.08, {
            pointB: { x: 90, y: 0 }
        });
        scene.matter.add.constraint(<any>wheelA, <any>chasis, 70, 0.08, {
            pointB: { x: 130, y: 0 }
        });

        scene.matter.add.constraint(<any>wheelB, <any>chasis, 70, 0.08, {
            pointB: { x: -90, y: 0 }
        });
        scene.matter.add.constraint(<any>wheelB, <any>chasis, 70, 0.08, {
            pointB: { x: -130, y:  0 }
        });
        scene.matter.add.constraint(<any>wheelB, <any>chasis, 70, 0.08, {
            pointB: { x: -180, y:  0 }
        });

        scene.matter.add.constraint(<any>wheelA, <any>wheelB, 190, 0.08, {
        });

        //Load Objects
        let loadProps = {
            mass: 10,
            restitution: 0.0,
            friction: 0.5
        }

        scene.matter.add.rectangle(pos.x+20,pos.y-60,40,100,loadProps)
        scene.matter.add.rectangle(pos.x-20,pos.y-60,40,100,loadProps)
        scene.matter.add.rectangle(pos.x-60,pos.y-60,40,100,loadProps)


        this.chasis = chasis
        this.wheelB = wheelB
        this.wheelA = wheelA

        return this;

    }

    applyDrivingForce(magnitude: number, direction: number) {

        magnitude = magnitude || 0.009;

        this.wheelA.applyForceFrom(new V2(this.wheelA.x, this.wheelA.y - 30), new V2(direction * magnitude, 0));
        this.wheelB.applyForceFrom(new V2(this.wheelB.x, this.wheelB.y - 30), new V2(direction * magnitude, 0));
        // this.chasis.applyForceFrom(new V2(this.chasis.x, this.chasis.y-30), new V2(direction*magnitude,0));

    }
}