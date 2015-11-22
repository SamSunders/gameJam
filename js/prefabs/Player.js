var Bomberman = Bomberman || {};
var bomb_num = 0;
var lives = 3;


Bomberman.Player = function (game_state, name, position, properties, lives) {
    "use strict";
    Bomberman.Prefab.call(this, game_state, name, position, properties, lives);
    
    this.anchor.setTo(0.5);
    
    this.walking_speed = +properties.walking_speed;
    this.bomb_duration = +properties.bomb_duration;
    this.dropping_bomb = false;
    
    // creates the animation of walking
    this.animations.add("walking_down", [1, 2, 3], 10, true);
    this.animations.add("walking_left", [4, 5, 6, 7], 10, true);
    this.animations.add("walking_right", [4, 5, 6, 7], 10, true);
    this.animations.add("walking_up", [0, 8, 9], 10, true);
    
    this.stopped_frames = [1, 4, 4, 0, 1];

    this.game_state.game.physics.arcade.enable(this);
    this.body.setSize(14, 12, 0, 4);

    this.cursors = this.game_state.game.input.keyboard.createCursorKeys();

    this.initial_position = new Phaser.Point(this.x, this.y);

    this.number_of_lives = localStorage.number_of_lives || +properties.number_of_lives;
    this.number_of_bombs = localStorage.number_of_bombs || +properties.number_of_bombs;
    this.current_bomb_index = 0;
    this.current_life_index = 3;
};

Bomberman.Player.prototype = Object.create(Bomberman.Prefab.prototype);
Bomberman.Player.prototype.constructor = Bomberman.Player;

Bomberman.Player.prototype.update = function () {
    "use strict";
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.bombs);
    this.game_state.game.physics.arcade.overlap(this, this.game_state.groups.explosions, this.die, null, this);
    this.game_state.game.physics.arcade.overlap(this, this.game_state.groups.enemies, this.die, null, this);
    
    if (this.cursors.left.isDown && this.body.velocity.x <= 0) {
        // move left
        this.body.velocity.x = -this.walking_speed;
        if (this.body.velocity.y === 0) {
            // change the scale, since we have only one animation for left and right directions
            this.scale.setTo(-1, 1);
            this.animations.play("walking_left");
        }
    } else if (this.cursors.right.isDown && this.body.velocity.x >= 0) {
        // move right
        this.body.velocity.x = +this.walking_speed;
        if (this.body.velocity.y === 0) {
            // change the scale, since we have only one animation for left and right directions
            this.scale.setTo(1, 1);
            this.animations.play("walking_right");
        }
    } else {
        this.body.velocity.x = 0;
    }

    if (this.cursors.up.isDown && this.body.velocity.y <= 0) {
        // move up
        this.body.velocity.y = -this.walking_speed;
        if (this.body.velocity.x === 0) {
            this.animations.play("walking_up");
        }
    } else if (this.cursors.down.isDown && this.body.velocity.y >= 0) {
        // move down
        this.body.velocity.y = +this.walking_speed;
        if (this.body.velocity.x === 0) {
            this.animations.play("walking_down");
        }
    } else {
        this.body.velocity.y = 0;
    }
    
    if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
        // stop current animation
        this.animations.stop();
        this.frame = this.stopped_frames[this.body.facing];
    }
    
    if (!this.dropping_bomb && this.game_state.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {

        this.drop_bomb();
        this.dropping_bomb = true;

    }
    
    if (this.dropping_bomb && !this.game_state.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        this.dropping_bomb = false;
    }
};

Bomberman.Player.prototype.drop_bomb = function () {
    // console.log(this.game_state.prefabs.lives.number_of_lives);

    "use strict";
    var bomb, bomb_name, bomb_position, bomb_properties;
    if(this.current_bomb_index < 100){
        // get the first dead bomb from the pool
        console.log("In If statment in drop_bomb function");
        this.current_bomb_index += 1; 
        bomb_name = this.name + "_bomb_" + this.game_state.groups.bombs.countLiving();
        bomb_position = new Phaser.Point(this.x, this.y);
        bomb_properties = {"texture": "bomb_spritesheet", "group": "bombs", bomb_radius: 3};
        bomb = Bomberman.create_prefab_from_pool(this.game_state.groups.bombs, Bomberman.Bomb.prototype.constructor, this.game_state, bomb_name, bomb_position, bomb_properties, bomb_num);
        console.log("Here is the num of bombs " + this.current_bomb_index);
    }
};

 Bomberman.Player.prototype.die = function () {
    "use strict";
     console.log("OH NO!!!! YOU DIED!!!! You had " + this.current_life_index + " lives.");
    // decrease the number of lives
    this.current_life_index -= 1;
    if(this.current_life_index <= 0){
        this.game_state.game_over();
    } else {
        console.log("You now only have " + this.current_life_index + " lives!");
        // if there are remaining lives, restart the player position
        this.x = this.initial_position.x;
        this.y = this.initial_position.y;
    }
};