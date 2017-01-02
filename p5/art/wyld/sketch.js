var numStars = 100;
var stars = [];
var ctx;
var trees = [];

function setup() {
  var canvas = createCanvas(600, 600);
  ctx = canvas.drawingContext;

  trees.push(generateTree(5, 7, .4364));
  trees.push(generateTree(5, 6, .4364));

  for (var i = 0; i < numStars; i++) {
    stars.push(createVector(random(width), random(height)));
  }
}

function draw() {
  background(27, 25, 46);

  var gradient = ctx.createRadialGradient(0, 0, 100, 0, 0, width / 2);
  gradient.addColorStop(0, "white");
  gradient.addColorStop(1, "#1b192e");
  ctx.fillStyle = gradient;
  translate(width / 2, height / 2);
  ellipse(0, 0, width * 2, height * 2);

  resetMatrix();

  stroke(255);
  for (var i = 0; i < stars.length; i++) {
    ellipse(stars[i].x, stars[i].y, 1, 1);
  }

  translate(width/2, height);
  renderTree(trees[0]);

  resetMatrix();

  //translate(width/2 - 100, height);
  //renderTree(trees[1]);
}
