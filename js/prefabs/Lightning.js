var CloudHop = CloudHop || {};

CloudHop.Lightning = function(game, x, y) {
	Phaser.Sprite.call(this, game, x, y, 'game-sprites', 'lightning-1');
	
	
    this.anchor.setTo(0.5);
    this.animations.add('anim', Phaser.Animation.generateFrameNames('lightning-', 1, 4), 20, true);
    this.animations.play('anim');
    this.angle = -10;
      

};

CloudHop.Lightning.prototype = Object.create(Phaser.Sprite.prototype);
CloudHop.Lightning.prototype.constructor = CloudHop.Lightning;










