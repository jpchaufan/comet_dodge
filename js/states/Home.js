var CloudHop = CloudHop || {};

CloudHop.HomeState = {

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

    
    //title text
    this.titleText = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'game-sprites' ,'titleText');
    this.titleText.anchor.setTo(0.5);
    this.clickToPlay = this.add.text(this.game.world.centerX, this.game.world.centerY+40, 'Click To Play', 
      {font: '20px Ariel', fill: '#5F04B4'});
    this.clickToPlay.anchor.setTo(0.5);

    this.titleText.inputEnabled = true;
    this.clickToPlay.inputEnabled = true;

    this.titleText.events.onInputDown.add(function(){
      this.game.state.start('Game');
    }, this);
    this.clickToPlay.events.onInputDown.add(function(){
      this.game.state.start('Game');
    }, this);


    this.loadLevel();
    this.game.world.sendToBack(this.background);

    //credits btn

    this.creditsBtn = this.add.text(this.game.world.width-100, 10, 'credits', 
      {font: '20px Ariel', fill: '#fff'});
    this.creditsBtn.inputEnabled = true;
    this.creditsBtn.events.onInputDown.add(function(){
      this.game.state.start('Credits');
    }, this);


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













