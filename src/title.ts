import { BetweenLevelState } from './gamestate';

export class TitleScene extends Phaser.Scene {
    constructor() {
      super({
        active: false,
        visible: false,
        key: 'Title',
      });
    }
  
    public preload() {
      this.load.image('title', '../assets/placeholder/quicktitle.png');
    }
  
    public create() {
      this.add.sprite(640, 360, "title");
      this.add.rectangle(436, 452, 497, 125, 0, 0)
      .setOrigin(0, 0)
        .setInteractive()
        .on('pointerup', () => {
          this.scene.start('Game', new BetweenLevelState());
        });
    }
}
  