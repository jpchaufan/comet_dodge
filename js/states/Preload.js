var CloudHop = CloudHop || {};

//loading the game assets
CloudHop.PreloadState = {
  preload: function() {
    //show loading screen
    this.logo = this.add.sprite(this.game.world.centerX, this.game.world.centerY-30, 'boot-sprites', 'logo');
    this.logo.anchor.setTo(0.5);
    this.logo.scale.setTo(1.2);

    this.loadingBar = this.add.sprite(this.game.world.centerX+10, this.game.world.centerY+50, 'boot-sprites', 'bar');
    this.loadingBar.anchor.setTo(0.5);
    this.loadingBar.scale.setTo(3);

    this.load.setPreloadSprite(this.loadingBar);

    //load game assets    
    this.load.atlasJSONHash('game-sprites', 'assets/images/game-sprites.png', 'assets/images/game-sprites.json');
    this.load.audio('gem', ['assets/audio/coin.mp3', 'assets/audio/coin.ogg']);
    this.load.audio('music', ['assets/audio/Mystical-Ocean-Puzzle-Game.mp3', 'assets/audio/Mystical-Ocean-Puzzle-Game.ogg']);
    this.load.audio('thunder', ['assets/audio/thunder.mp3', 'assets/audio/thunder.ogg']);
    this.load.audio('zap', ['assets/audio/zap.mp3', 'assets/audio/zap.ogg']);
    this.load.audio('success', ['assets/audio/success.mp3', 'assets/audio/success.ogg']);
  },
  create: function() {
    this.state.start('Home');
  }
};