/**
 * Basic rain example.
 * Inspired by Daniel Shiffman
 * https://www.youtube.com/watch?v=KkyIDI6rQJI&t=509s&list=PLRqwX-V7Uu6ZiZxtDDRCi6uhfTH4FilpH&index=4
 */

/**
 * A Drop class instance that manages each drop in the rain in terms of position,
 * acceleration and rendering.
 */
var Drop = function() {

  this.acceleration = 1;
  this.maxVelocity = 30;
  this.velocity = createVector(0, 0);

  this.setup = function() {
    this.position = createVector(random(width), -random(height));
  }

  this.update = function() {
    this.velocity.y = this.velocity.y + this.acceleration;
    this.velocity.limit(this.maxVelocity);

    this.position.add(this.velocity);

    if (this.position.y > height) {
      this.setup();
    }
  }
  this.draw = function() {
    line(
      this.position.x,
      this.position.y,
      this.position.x,
      this.position.y + this.velocity.y
    );
  }
}

/* Control variable for number of drops */
var numDrops = 50;

/** List of all drops */
var drops = [];

/**
 * Setup the scene with a canvas and init the drops list.
 */
function setup() {
  createCanvas(480, 480);
  for (var i = 0; i < numDrops; i++) {
    var drop = new Drop();
    drop.setup();
    drops.push(drop);
  }
}

/**
 * Render all the drops and update them.
 */
function draw() {
  background(95, 115, 145);
  stroke(200, 220, 240);
  strokeWeight(random(1, 2));

  for (var i = 0; i < drops.length; i++) {
    drops[i].update();
    drops[i].draw();
  }
}
