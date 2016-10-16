var CloudHop = CloudHop || {};

CloudHop.Platform = function(game, floorPool, numTiles, x, y, speed, coinsPool) {
	Phaser.Group.call(this, game);
	
	this.tileSize = 40;
	this.game = game;
	this.enableBody = true;
	this.speed = speed;
	this.floorPool = floorPool;
	this.coinsPool = coinsPool;
	
	this.prepare(numTiles, x, y, speed);


	// floating clouds
	this.floatSpeed = 300+Math.random()*1200;
	this.floatUp = game.add.tween(this);
    this.floatUp.to({y: '-8'}, this.floatSpeed);

    this.floatDown = game.add.tween(this);
    this.floatDown.to({y: '+8'}, this.floatSpeed);

    this.floatUp.onComplete.add(function(){
      this.floatDown.start();
    }, this);

    this.floatDown.onComplete.add(function(){
      this.floatUp.start();
    }, this);

    this.floatUp.start();
      

};

CloudHop.Platform.prototype = Object.create(Phaser.Group.prototype);
CloudHop.Platform.prototype.constructor = CloudHop.Platform;

CloudHop.Platform.prototype.prepare = function(numTiles, x, y, speed) {

	this.alive = true;



	var i = 0;
	while(i < numTiles){
	
		var floorTile = this.floorPool.getFirstExists(false);
		
		if(!floorTile) {
			floorTile = new Phaser.Sprite(this.game, x + i * this.tileSize, y, 'game-sprites', 'cloud-1');
		}
	    else {
			floorTile.reset(x + i * this.tileSize, y);
	    }

		
	    this.add(floorTile);    
	    floorTile.body.setSize(60, 0, 0, 10);
	    i++;
	}
  
	//set physics properties
	this.setAll('body.immovable', true);
	this.setAll('body.allowGravity', false);
	this.setAll('body.velocity.x', speed);



	this.addCoins();
}


CloudHop.Platform.prototype.kill = function(){
	this.alive = false;
	this.callAll('kill');


	while (this.children.length > 0){
		this.floorPool.add(this.children[0]);
	}
	// this.forEach(function(tile){
	// 	this.floorPool.add(tile);
	// }, this);
}


CloudHop.Platform.prototype.addCoins = function(){
	var coinsY = 50 + Math.random()*(140);

	var hasCoin;
	this.forEach(function(tile){
		hasCoin = Math.random() <= 0.4;

		if (hasCoin){
			var coin = this.coinsPool.getFirstExists(false);

			if (!coin){
				coin = new Phaser.Sprite(this.game, tile.x, tile.y - coinsY, 'game-sprites', 'jewel-red-1');
				this.coinsPool.add(coin);
			} else {
				coin.reset(tile.x, tile.y - coinsY);
			}
			coin.animations.add('shine', Phaser.Animation.generateFrameNames('jewel-red-', 1, 6), 10, false);
			coin.animations.play('shine');	

			var shineTime = Phaser.Timer.SECOND * Math.max( (4 * Math.random()), 1 );
			coin.shineTimer = this.game.time.events.loop(shineTime, function(){
				coin.animations.play('shine');	
			}, this)
			

			coin.body.velocity.x = this.speed;
			coin.body.allowGravity = false;
		}
	}, this);
}









