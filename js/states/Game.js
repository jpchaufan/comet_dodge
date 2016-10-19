var CloudHop = CloudHop || {};

CloudHop.GameState = {

  init: function() {
    
    //pool of floors
    this.floorPool = this.add.group();

    this.platformPool = this.add.group();

    this.gemsPool = this.add.group();
    this.gemsPool.enableBody = true;

    this.extraSaviorClouds = this.add.group()
    this.extraSaviorClouds.enableBody = true;

    this.saviorClouds = this.add.group();
    this.saviorClouds.enableBody = true;
    this.playerBeingSaved = false;
    this.savesLeft = 3;

    //gravity
    this.game.physics.arcade.gravity.y = 1000;  

    //max jump
    this.maxJump = 120;

    this.cursors = this.game.input.keyboard.createCursorKeys(); 

    this.playerScore = 0;

    this.levelSpeed = -200;
    this.speedFixer = 250;

    this.playerX = 100;

    //lightning
    this.lightning = this.add.group();
    this.lightning.enableBody = true;
    this.thunder = this.add.audio('thunder');

    //collect extra cloud sound
    this.success = this.add.audio('success');



    
  },
  create: function() {
    //moving background
    this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'game-sprites', 'clouds-bg');
    this.background.tileScale.y = 1.3;
    this.background.autoScroll(this.levelSpeed/6, 0);
    

    //hard-code first platform
    this.currentPlatform = new CloudHop.Platform(this.game, this.floorPool, 12, 0, 200, this.levelSpeed, this.gemsPool, this.extraSaviorClouds);
    this.platformPool.add(this.currentPlatform);

    //player
    this.player = this.add.sprite(this.playerX, 50, 'game-sprites', 'run_1');
    this.player.anchor.setTo(0.5);
    this.player.animations.add('running', Phaser.Animation.generateFrameNames('run_', 1, 3), 10, true);

    this.game.physics.arcade.enable(this.player);
    this.player.body.setSize(55, 55, 15, 25);
    this.player.animations.play('running');
    this.zap = this.add.audio('zap');

    this.gemSound = this.add.audio('gem');
    this.gemSound.volume = 0.2;

    this.loadLevel();
    this.game.world.sendToBack(this.player);
    this.game.world.sendToBack(this.background);
    
    //show gems
    var style = {font: '30px Ariel', fill: '#fff'};
    this.gemCountLabel = this.add.text(10, 10, 'Score: 0', style);

    //show savior clouds left
    this.saviorsLeftImg = this.game.add.sprite(10, 50, 'game-sprites', 'cloud-1');
    this.saviorsLeftImg.scale.setTo(0.5);
    this.saviorsLeftText = this.game.add.text(50, 46, "x"+this.savesLeft, {font: '20px Ariel', fill: '#fff'})

    //music
    this.music = this.add.audio('music');
    this.music.loop = true;
    this.music.stop();
    this.music.play();

    //mute button
    this.muteButton();

    //start lightning
    this.game.time.events.add(Phaser.Timer.SECOND*(5+Math.random()*15), this.setupLightningTimer, this);
  },   
  update: function() {
    if (!this.playerBeingSaved){
      this.game.physics.arcade.overlap(this.player, this.lightning, this.zapped, null, this);
      this.game.physics.arcade.overlap(this.player, this.gemsPool, this.collectGem, null, this);  
      this.game.physics.arcade.overlap(this.player, this.extraSaviorClouds, this.collectCloud, null, this);  
    } else {
      this.game.physics.arcade.collide(this.player, this.saviorClouds);  
    }
    

    

    this.platformPool.forEachAlive(function(platform, index){
      if (!this.playerBeingSaved){
        this.game.physics.arcade.collide(this.player, platform);  
      }
      

      //check for platforms to kill
      if (platform.length && platform.children[platform.length-1].right < 0){
        platform.kill();
      }
    }, this);

    //kill gems that leave the screen
    this.gemsPool.forEachAlive(function(gem){
      if(gem.right <= 0) {
        gem.kill();
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
      } 
      else if (this.cursors.up.isUp || this.game.input.activePointer.isUp){
        this.isJumping = false;
      }
    }

    //align savior cloud
    if (this.playerBeingSaved){
      this.saviorClouds.setAll('x', this.player.x);
    }

    //check for savior cloud
    if ( this.player.bottom >= this.game.world.height-20 && this.savesLeft > 0 && !this.playerBeingSaved){
      this.createSaviorCloud();
    }

    //check for game over
    if ( (this.player.top >= this.game.world.height || this.player.left <= 0) && this.player.alive ){
      this.gameOver();
    }

  },
  createSaviorCloud: function(){
    this.playerBeingSaved = true;
    this.blinkStart(0.3);
    this.savesLeft -= 1;
    this.saviorsLeftText.text = "x"+this.savesLeft;

    var saviorCloud = this.saviorClouds.getFirstExists(false);
    var x = this.player.x;
    var y = this.player.bottom+30;
    if (!saviorCloud){
      saviorCloud = this.saviorClouds.create(x, y, 'game-sprites', 'cloud-1');
    }else {
      saviorCloud.reset(x, y);
    }
    saviorCloud.anchor.setTo(0.5);
    saviorCloud.body.immovable = true;
    saviorCloud.body.allowGravity = false;
    
    this.player.body.velocity.y = 0;
    saviorCloud.body.velocity.y = -210;
    this.game.time.events.add(Phaser.Timer.SECOND*1, function(){
      saviorCloud.body.velocity.y = 0;
      this.player.body.velocity.y = 0;
      this.game.time.events.add(Phaser.Timer.SECOND*1, function(){
        
        this.game.time.events.remove(this.blinkTimer);
        this.blinkStart(0.1);

        this.game.time.events.add(Phaser.Timer.SECOND*1, function(){
          this.playerBeingSaved = false;
          this.game.time.events.remove(this.blinkTimer);
          this.player.alpha = 1;
          saviorCloud.kill();
        }, this);

      }, this);
    }, this);
  },
  blinkStart: function(time){
    this.blinkTimer = this.game.time.events.add(Phaser.Timer.SECOND*time, function(){
      if (this.player.alpha == 1){
        this.player.alpha = .3;
      } else {
        this.player.alpha = 1;
      }
    }, this);
    this.blinkTimer.loop = true;
    this.blinkTimer.autoDestroy = true;
  },
  setupLightningTimer: function(){
    this.createLightning();
    var seconds = 7 + Math.random()*8;
    this.game.time.events.add(Phaser.Timer.SECOND * seconds, this.setupLightningTimer, this);
    
  },
  createLightning: function(){
    var lightning = this.lightning.getFirstExists(false);
    var randX = -10+Math.random()*30;
    if (!lightning){
      lightning = new CloudHop.Lightning(this.game, this.game.world.width+randX, -20);
      this.lightning.add(lightning);
    } else {
      lightning.reset(this.game.world.width+randX, -20)
    }

    var speed = 80;
    lightning.body.allowGravity = false;
    lightning.body.velocity.x = -4*speed;
    lightning.body.velocity.y = 2*speed;
    lightning.activated = true;

    this.thunder.play();
  },
  zapped: function(player, lightning){
    //
    if (lightning.activated){
      lightning.activated = false;
      player.body.y -= 1;
      player.body.velocity.y = -(500 + Math.random()*300);

      this.zap.play();
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
        nextPlatformData.y, this.levelSpeed, this.gemsPool, this.extraSaviorClouds);  
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
  collectGem: function(player, gem){
    gem.kill();
    this.playerScore += gem.value;
    this.gemSound.play();
    this.gemCountLabel.text = 'Score: '+this.playerScore;
  },
  collectCloud: function(player, cloud){
    cloud.kill();
    this.savesLeft++;
    this.success.play();
    this.saviorsLeftText.text = "x"+this.savesLeft;
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
      this.add.text(this.game.width/2, this.game.height/2+50, 'Your Score: '+this.playerScore, style).anchor.setTo(0.5);
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

    if (this.playerScore > this.highScore){
      this.highScore = this.playerScore;
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
    
  //   this.lightning.forEachAlive(function(ltn){
  //     this.game.debug.body(ltn);  
  //   }, this);
  // }
};













