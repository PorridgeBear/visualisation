/*
 * Implementation of http://www.kfish.org/boids/pseudocode.html in P5.js
 */

var numBoids = 150;
var boids = [];

/**
 * Create the canvas and create boids randomly.
 */
function setup() {
  createCanvas(800, 600);
  frameRate(20);
  for (var i = 0; i < numBoids; i++) {
    boids.push(new Boid(random(width), random(height)));
  }
}

/**
 * Boids try to fly towards the centre of mass of neighbouring boids.
 */
ruleFlyToCentreOfFlock = function(bi, boid) {
  var bipc = createVector();

  for (var i = 0; i < boids.length; i++) {
    if (bi != i) {
			bipc.add(boids[i].position);
    }
  }

  bipc.div(boids.length - 1);

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
      if (a.mag() < boid.diameter * 2) {
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
 * Boids do not venture outside the canvas bounds.
 */
ruleFlyInsideBounds = function(bi, boid) {

  var edgeThreshold = boid.diameter * 2;

  if (boid.position.x - edgeThreshold < 0 ||
      boid.position.x + edgeThreshold > width) {
    boid.velocity.normalize();
    boid.velocity.mult(1);
  }

  if (boid.position.y - edgeThreshold < 0 ||
      boid.position.y + edgeThreshold > height) {
    boid.velocity.normalize();
    boid.velocity.mult(1);
  }
}

/**
 * Render the boids.
 */
function draw() {

  background(0);
  noStroke();
  fill(255);

  for (var i = 0; i < boids.length; i++) {
    var b = boids[i];

    b.draw();

    var v1 = ruleFlyToCentreOfFlock(i, b);
    var v2 = ruleFlyCloseToOthers(i, b);
    var v3 = ruleFlyAtSimilarVelocityToOthers(i, b);
    var v4 = ruleFlyInsideBounds(i, b);

    b.velocity.add(v1);
    b.velocity.add(v2);
    b.velocity.add(v3);
    b.velocity.add(v4);
		b.position.add(b.velocity);
  }
}

/**
 * The Boid class.
 */
var Boid = function(x, y) {

  this.diameter = 2;
  this.position = createVector(x, y);
  this.velocity = createVector(0);

  this.draw = function() {
    ellipse(this.position.x, this.position.y, this.diameter, this.diameter);
  }
}
