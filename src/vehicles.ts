import * as Phaser from 'phaser';

export class Vehicle {




}

export class Vehicles {

    preload(scene: Phaser.Scene) {
        scene.load.image('generic_wheel', '../assets/placeholder/generic_wheel.png');
        scene.load.image('pickup_chasis', '../assets/placeholder/pickup_chasis.png');
        scene.load.image('spr_car4_0', '../assets/placeholder/spr_car4_0.png');
        scene.load.image('spr_casualcar_0', '../assets/placeholder/spr_casualcar_0.png');
        scene.load.image('spr_estatecar_0', '../assets/placeholder/spr_estatecar_0.png');
        scene.load.image('spr_van_0', '../assets/placeholder/spr_van_0.png');
    }


    createVehicle(scene: Phaser.Scene) {

        let pos = {x:400, y:300};

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
        chasis.setOrigin(0.6,0.7)
        chasis.scale = 0.6
        // chasis.setRectangle(300, 100, {
        //     mass: 30,
        //     restitution: 0.9,
        //     friction: 0.4,
        //     isStatic: false,
        //     collisionFilter: {
        //         group: vehicleGroup
        //     }
        // });
        // chasis.scale = 0.3

        // let wheelA = scene.matter.add.image(250, 300, 'generic_wheel');
        // wheelA.setCircle(30, {
        //     mass: 30,
        //     restitution: 0.9,
        //     friction: 0.4,
        //     isStatic: false,
        //     collisionFilter: {
        //         group: vehicleGroup
        //     }
        // });
        // wheelA.scale = 0.6


        // let wheelB = scene.matter.add.image(50, 300, 'generic_wheel');
        // wheelB.setCircle(30, {
        //     mass: 30,
        //     restitution: 0.9,
        //     friction: 0.4,
        //     isStatic: false,
        //     collisionFilter: {
        //         group: vehicleGroup
        //     }
        // });
        // wheelB.scale = 0.6

        // scene.matter.add.constraint(<any>wheelA, <any>chasis, 40, 0.08, {
        //     pointB: { x: 90, y: 50 }
        // });
        // scene.matter.add.constraint(<any>wheelA, <any>chasis, 40, 0.08, {
        //     pointB: { x: 130, y: 50 }
        // });
        // scene.matter.add.constraint(<any>wheelB, <any>chasis, 40, 0.08, {
        //     pointB: { x: -70, y: 50 }
        // });
        // scene.matter.add.constraint(<any>wheelB, <any>chasis, 40, 0.08, {
        //     pointB: { x: -110, y: 50 }
        // });

        return null;

    }
}