var CloudHop = CloudHop || {};

CloudHop.CreditsState = {

  init: function() {
    
    //pool of floors
    this.floorPool = this.add.group();

    this.platformPool = this.add.group();

    this.coinsPool = this.add.group();
    this.coinsPool.enableBody = true;
    
    this.levelSpeed = 0;

    
  },
  create: function() {

    //moving background
    this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'game-sprites', 'clouds-bg');
    this.background.tileScale.y = 1.3;
    this.background.autoScroll(this.levelSpeed/6, 0);
    

    //hard-code first platform
    this.currentPlatform = new CloudHop.Platform(this.game, this.floorPool, 8, 65, 200, this.levelSpeed, this.coinsPool);
    this.platformPool.add(this.currentPlatform);

    
    //credits text
    var color = '#9A2EFE';
    var style = {font: '30px Ariel', fill: color};
    this.add.text(this.game.world.centerX, this.game.world.centerY-85, 'Credits', 
      style).anchor.setTo(0.5);

    style = {font: '16px Ariel', fill: color};
    this.add.text(this.game.world.centerX, this.game.world.centerY+5, 'Game Created By', 
      style).anchor.setTo(0.5);


    this.add.text(this.game.world.centerX, this.game.world.centerY-50, 'Music By', 
      style).anchor.setTo(0.5);

    style = {font: '20px Ariel', fill: color};
    this.add.text(this.game.world.centerX, this.game.world.centerY+25, 'JP Chaufan at codeWillow.com', 
      style).anchor.setTo(0.5);

    this.add.text(this.game.world.centerX, this.game.world.centerY-30, 'Eric Matyas at www.soundimage.org', 
      style).anchor.setTo(0.5);
    

    // click to go back
    this.background.inputEnabled = true;
    this.background.events.onInputDown.add(function(){
      this.game.state.start('Home')
    }, this);


    
    this.loadLevel();
    this.game.world.sendToBack(this.background);

    

  },   
  update: function() { 

   
      //check for platforms to kill
    this.platformPool.forEachAlive(function(platform, index){
      if (platform.length && platform.children[platform.length-1].right < 0){
        platform.kill();
      }
    }, this);

    //kill coins that leave the screen
    this.coinsPool.forEachAlive(function(coin){
      if(coin) {
        coin.kill();
      }
    }, this);

    // get new platforms when old one is fully visible
    if (this.currentPlatform.length && this.currentPlatform.children[this.currentPlatform.length-1].right < this.game.world.width){
      this.createPlatform();
    }
    

    
  },
  loadLevel: function(){
  
    
    
    this.createPlatform();
  },
  createPlatform: function(){
    var nextPlatformData = this.generateRandomPlatform();
    if (nextPlatformData){

      this.currentPlatform = this.platformPool.getFirstDead();

      if (!this.currentPlatform){
        this.currentPlatform = new CloudHop.Platform(this.game, this.floorPool, 
        nextPlatformData.numTiles, this.game.world.width + nextPlatformData.separation, 
        nextPlatformData.y, this.levelSpeed, this.coinsPool);  
      } else {
        this.currentPlatform.prepare(nextPlatformData.numTiles, this.game.world.width + nextPlatformData.separation, 
        nextPlatformData.y, this.levelSpeed);  
      }

      

      
    this.platformPool.add(this.currentPlatform);
    } 
  },
  generateRandomPlatform: function(){
     var data = {};

     var minSeparation = 60;
     var maxSeparation = 200;
     data.separation = minSeparation + Math.random()*(maxSeparation - minSeparation);


     var minDiffY = -120;
     var maxDiffY = 120;
     data.y = this.currentPlatform.children[0].y + ( minDiffY + Math.random()*(maxDiffY - minDiffY) );
     data.y = Math.max(150, data.y);
     data.y = Math.min(this.game.world.height-50, data.y);

     var minTiles = 1;
     var maxTiles = 5;
     data.numTiles = minTiles + ( Math.random()*(maxTiles-minTiles) );

     return data;

  }
};













