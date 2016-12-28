/*
 * Implementation of http://www.kfish.org/boids/pseudocode.html in P5.js
 * with rule 1 modification to follow mouse.
 *
 * Triangle geometry taken from Dan Shiffman.
 */

var numBoids = 100;
var boids = [];

/**
 * Create the canvas and create boids randomly.
 */
function setup() {
  createCanvas(800, 600);
  for (var i = 0; i < numBoids; i++) {
    boids.push(new Boid(random(width), random(height)));
  }
}

/**
 * Boids try to fly towards the mouse pointer.
 */
ruleFlyToMouse = function(bi, boid) {
  var bipc = createVector(mouseX, mouseY);

  var v = p5.Vector.sub(bipc, boid.position);
  v.div(100);

  return v;
}

/**
 * Boids try to keep a small distance away from other objects
 * (including other boids).
 */
ruleFlyCloseToOthers = function(bi, boid) {
  var c = createVector();

  for (var i = 0; i < boids.length; i++) {
    if (bi != i) {
      var b = boids[i];
      var a = p5.Vector.sub(b.position, boid.position);

      if (a.mag() < boid.diameter) {
        c.sub(a);
      }
    }
  }

  return c;
}

/**
 * Boids try to match velocity with near boids.
 */
ruleFlyAtSimilarVelocityToOthers = function(bi, boid) {
  var pv = createVector();

  for (var i = 0; i < boids.length; i++) {
    if (bi != i) {
      pv.add(boids[i].velocity);
    }
  }

  pv.div(boids.length - 1);

  var v = p5.Vector.sub(pv, boid.velocity);
  v.div(8);

  return v;
}

/**
 * Render the boids.
 */
function draw() {

  background(0);
  fill(255);
  noStroke();

  for (var i = 0; i < boids.length; i++) {
    var b = boids[i];

    b.draw();

    var v1 = ruleFlyToMouse(i, b);
    var v2 = ruleFlyCloseToOthers(i, b);
    var v3 = ruleFlyAtSimilarVelocityToOthers(i, b);

    b.velocity.add(v1);
    b.velocity.add(v2);
    b.velocity.add(v3);

		b.position.add(b.velocity);
  }
}

/**
 * The Boid class.
 */
var Boid = function(x, y) {

  this.diameter = 15;
  this.position = createVector(x, y);
  this.velocity = createVector(0);
  this.r = 3;

  this.draw = function() {

    // Nice idea from Dan Shiffman to prevent over acceleration
    this.velocity.limit(3);

    // Draw triangle boid as tri pointed in direction of velocity
    // Taken from Dan Shiffman's Nature of Code boid draw function
    // https://github.com/shiffman/The-Nature-of-Code-Examples-p5.js/tree/master/chp06_agents/NOC_6_09_Flocking
    var theta = this.velocity.heading() + radians(90);

    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    beginShape();
    vertex(0, -this.r*2);
    vertex(-this.r, this.r*2);
    vertex(this.r, this.r*2);
    endShape(CLOSE);
    pop();
  }
}
