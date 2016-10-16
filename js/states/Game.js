var CloudHop = CloudHop || {};

CloudHop.GameState = {

  init: function() {
    
    //pool of floors
    this.floorPool = this.add.group();

    this.platformPool = this.add.group();

    this.coinsPool = this.add.group();
    this.coinsPool.enableBody = true;
    
    //gravity
    this.game.physics.arcade.gravity.y = 1000;  

    //max jump
    this.maxJump = 120;

    this.cursors = this.game.input.keyboard.createCursorKeys(); 

    this.myCoins = 0;

    this.levelSpeed = -200;
    this.speedFixer = 250;

    this.playerX = 100;

    
  },
  create: function() {

    //moving background
    this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'game-sprites', 'clouds-bg');
    this.background.tileScale.y = 1.3;
    this.background.autoScroll(this.levelSpeed/6, 0);
    

    //hard-code first platform
    this.currentPlatform = new CloudHop.Platform(this.game, this.floorPool, 12, 0, 200, this.levelSpeed, this.coinsPool);
    this.platformPool.add(this.currentPlatform);

    //player
    this.player = this.add.sprite(this.playerX, 50, 'game-sprites', 'run_1');
    this.player.anchor.setTo(0.5);
    this.player.animations.add('running', Phaser.Animation.generateFrameNames('run_', 1, 3), 10, true);

    this.game.physics.arcade.enable(this.player);
    this.player.body.setSize(55, 70, 15, 10);
    this.player.animations.play('running');


    this.coinSound = this.add.audio('coin');
    this.coinSound.volume = 0.2;

    this.loadLevel();
    this.game.world.sendToBack(this.player);
    this.game.world.sendToBack(this.background);

    //show coins
    var style = {font: '30px Ariel', fill: '#fff'};
    this.coinCountLabel = this.add.text(10, 10, 'Score: 0', style);

    //music
    this.music = this.add.audio('music');
    this.music.loop = true;
    this.music.stop();
    this.music.play();

    //mute button
    this.muteButton();
  },   
  update: function() { 

   
    this.game.physics.arcade.overlap(this.player, this.coinsPool, this.collectCoin, null, this);

    this.platformPool.forEachAlive(function(platform, index){
      this.game.physics.arcade.collide(this.player, platform);

      //check for platforms to kill
      if (platform.length && platform.children[platform.length-1].right < 0){
        platform.kill();
      }
    }, this);

    //kill coins that leave the screen
    this.coinsPool.forEachAlive(function(coin){
      if(coin.right <= 0) {
        coin.kill();
      }
    }, this);

    // player velocity
    if (this.player.body.touching.down){
      this.player.body.velocity.x = -this.levelSpeed;  
    } else {
      this.player.body.velocity.x = 0;
    }
    // help keep player still
    if (this.player.x != this.playerX )  this.player.x = this.playerX;


    // get new platforms when old one is fully visible
    if (this.currentPlatform.length && this.currentPlatform.children[this.currentPlatform.length-1].right < this.game.world.width){
      this.createPlatform();
    }
    
     //controls
    if (this.player.alive){
      if (this.cursors.up.isDown || this.game.input.activePointer.isDown){
        this.playerJump();
      } else if (this.cursors.up.isUp || this.game.input.activePointer.isUp){
        this.isJumping = false;
      }
    }

    //check for game over
    if ( (this.player.top >= this.game.world.height || this.player.left <= 0) && this.player.alive ){
      this.gameOver();
    }

    
  },
  playerJump: function(){
    if (this.player.body.touching.down){
      this.startJumpY = this.player.y;
      this.isJumping = true;
      this.jumpPeaked = false;
      this.player.body.velocity.y = -300;
    } else if (this.isJumping && !this.jumpPeaked){
      var distanceJumped = this.startJumpY - this.player.y;
      if (distanceJumped < this.maxJump){
        this.player.body.velocity.y = -300;
      } else {
        this.jumpPeaked = true;
      }
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

  },
  collectCoin: function(player, coin){
    coin.kill();
    this.myCoins++;
    this.coinSound.play();
    this.coinCountLabel.text = 'Score: '+this.myCoins;
  },
  gameOver: function(){
    this.player.kill();
    this.updateHighScore();

    // overlay
    this.overlay = this.add.bitmapData(this.game.width, this.game.height);
    this.overlay.ctx.fillStyle = '#000';
    this.overlay.ctx.fillRect(0, 0, this.game.width, this.game.height);

    this.panel = this.add.sprite(0, this.game.height, this.overlay);
    this.panel.alpha = 0.55;

    var gameOverPanel = this.add.tween(this.panel);
    gameOverPanel.to({y: 0}, 500);

    gameOverPanel.onComplete.add(function(){

      var style = {font: '30px Ariel', fill: '#fff'};
      this.add.text(this.game.width/2, this.game.height/2-30, 'GAME OVER', style).anchor.setTo(0.5);

      style = {font: '20px Ariel', fill: '#fff'};
      this.add.text(this.game.width/2, this.game.height/2+20, 'High Score: '+this.highScore, style).anchor.setTo(0.5);
      this.add.text(this.game.width/2, this.game.height/2+50, 'Your Score: '+this.myCoins, style).anchor.setTo(0.5);
      style = {font: '12px Ariel', fill: '#fff'};
      this.add.text(this.game.width/2, this.game.height/2+90, 'Tap to play Again', style).anchor.setTo(0.5);

      this.game.input.onDown.addOnce(this.restart, this);
      
    }, this);

    gameOverPanel.start();


    //this.restart();
  },
  restart: function(){
    this.game.world.remove(this.background);
    this.music.stop();
    this.game.state.start('Game');
  },
  updateHighScore(){
    this.highScore = +localStorage.getItem('highScore');

    if (this.myCoins > this.highScore){
      this.highScore = this.myCoins;
      localStorage.setItem('highScore', this.highScore);
    }

    
  },
  muteButton: function(){


      // MUTE BUTTON

      this.muteBtn = this.add.sprite(this.game.world.width-58, 10, 'game-sprites', 'soundOn');

      if (this.game.sound.mute){
         this.muteBtn.loadTexture('game-sprites', 'soundOff');
      }

      this.muteBtn.inputEnabled = true;
      this.muteBtn.events.onInputDown.add(function(){
        if( !this.game.sound.mute ){
          // mute
          this.game.sound.mute = true;
          this.muteBtn.loadTexture('game-sprites', 'soundOff');
        } else { //unmute
          this.game.sound.mute = false;
          this.muteBtn.loadTexture('game-sprites', 'soundOn');
        }
      }, this);
  }
  // ,
  // render: function(){
  //   this.game.debug.body(this.player);  
  //   //this.game.debug.bodyInfo(this.player, 5, 10);
  // }
};













