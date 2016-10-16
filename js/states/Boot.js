var CloudHop = CloudHop || {};

//setting game configuration and loading the assets for the loading screen
CloudHop.BootState = {
  init: function() {
    //loading screen will have a white background
    this.game.stage.backgroundColor = '#fff';  
    
    //scaling options
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    
    //have the game centered horizontally
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    //physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);    
  },
  preload: function() {
    this.load.atlasJSONHash('boot-sprites', 'assets/images/boot-sprites.png', 'assets/images/boot-sprites.json');
  },
  create: function() {
    this.state.start('Preload');
  }
};