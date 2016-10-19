var CloudHop = CloudHop || {};

CloudHop.Platform = function(game, floorPool, numTiles, x, y, speed, gemsPool, extraSaviorClouds) {
	Phaser.Group.call(this, game);
	
	this.tileSize = 40;
	this.game = game;
	this.enableBody = true;
	this.speed = speed;
	this.floorPool = floorPool;
	this.gemsPool = gemsPool;
	this.extraSaviorClouds = extraSaviorClouds;
	// console.log(this.extraSaviorClouds);
	// console.log(this.gemsPool);
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

	    floorTile.body.setSize(floorTile.width, 0, 0, 10);
	    i++;
	}
  
	//set physics properties
	this.setAll('body.immovable', true);
	this.setAll('body.allowGravity', false);
	this.setAll('body.velocity.x', speed);



	this.addCollectibles();
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


CloudHop.Platform.prototype.addCollectibles = function(){
	var gemsY = 50 + Math.random()*(140);

	var hasgem;
	this.forEach(function(tile){
		hasGem = Math.random() <= 0.4;

		if (hasGem){
			var gem = this.gemsPool.getFirstExists(false);

			//choose red blue or green

			var color = "green";
			var value = 1;

			var chance = Math.random();
			if ( chance > 0.9 ){
				color = "blue";
				value = 5;
			} else if ( chance > 0.7 ){
				color = "red";
				value = 3;
			}



			if (!gem){
				gem = new Phaser.Sprite(this.game, tile.x, tile.y - gemsY, 'game-sprites', 'jewel-'+color+'-1');
				this.gemsPool.add(gem);
			} else {
				gem.reset(tile.x, tile.y - gemsY);
			}
			gem.value = value;
			gem.animations.add('shine', Phaser.Animation.generateFrameNames('jewel-'+color+'-', 1, 6), 10, false);
			gem.animations.play('shine');	

			var shineTime = Phaser.Timer.SECOND * Math.max( (4 * Math.random()), 1 );
			gem.shineTimer = this.game.time.events.loop(shineTime, function(){
				gem.animations.play('shine');	
			}, this)
			

			gem.body.velocity.x = this.speed;
			gem.body.allowGravity = false;
		} 
		else if ( Math.random() > 0.998 ){ // extra cloud
			if (this.extraSaviorClouds){
				var extra = this.extraSaviorClouds.getFirstExists(false);

				if (!extra){
					extra = new Phaser.Sprite(this.game, tile.x, tile.y - gemsY, 'game-sprites', 'cloud-1');
					this.extraSaviorClouds.add(extra);
				} else {
					extra.reset(tile.x, tile.y - gemsY);
				}
				extra.scale.setTo(0.4);

				extra.body.velocity.x = this.speed;
				extra.body.allowGravity = false;	
			}
		}
	}, this);
}









