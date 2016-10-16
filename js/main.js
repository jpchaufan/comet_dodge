var CloudHop = CloudHop || {};

CloudHop.game = new Phaser.Game(480, 320, Phaser.CANVAS);

CloudHop.game.state.add('Boot', CloudHop.BootState);
CloudHop.game.state.add('Preload', CloudHop.PreloadState);
CloudHop.game.state.add('Home', CloudHop.HomeState);
CloudHop.game.state.add('Credits', CloudHop.CreditsState);
CloudHop.game.state.add('Game', CloudHop.GameState);

CloudHop.game.state.start('Boot');
