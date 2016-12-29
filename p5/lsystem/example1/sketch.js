/*
 * An implementation of Example 7 Fractal Plant L-System at
 * https://en.wikipedia.org/wiki/L-system
 */

var axiom = "X";

var rules = [
  { src: "X", dst: "F-[[X]+X]+F[+FX]-X" },
  { src: "F", dst: "FF" }
];

var generations = 5;
var sentence = axiom;
var branchLength = 4;
var angle = .4363; // 25 degrees in radians

var colours = [
  { r: 163, g: 176, b: 91 },
  { r:  98, g: 110, b: 16 },
  { r:  69, g:  52, b: 32 },
  { r:  65, g:  80, b:  5 },
];

/**
 * Create a drawing canvas, create generations of the sentence and render.
 */
function setup() {
  createCanvas(600, 600);

  for (var i = 0; i < generations; i++) {
    generate();
  }

  background(98, 235, 247);
  stroke(255);

  createP(sentence);
  render();
}

/**
 * Implement the generation function to expand the axiom.
 */
function generate() {

  var str = "";

  for (var i = 0; i < sentence.length; i++) {

    var char = sentence.charAt(i);
    var found = false;

    for (var j = 0; j < rules.length; j++) {
      if (rules[j].src === char) {
        str = str + rules[j].dst;
        found = true;
        break;
      }
    }

    if (!found) {
      str = str + char;
    }
  }

  sentence = str;
}

/**
 * Render the sentence to the canvas according to the rules for drawing.
 * Started to the left a bit as the tree tends to produce to the right.
 */
function render() {

  translate(width/2, height);

  for (var i = 0; i < sentence.length; i++) {
    var char = sentence.charAt(i);
    switch (char) {
      case "F":
        var c = colours[floor(random(0, colours.length - 1))];
        stroke(c.r, c.g, c.b);
        line(0, 0, 0, -branchLength);
        translate(0, -branchLength);
        break;
      case "-":
        rotate(-angle);
        break;
      case "+":
        rotate(angle);
        break;
      case "[":
        push();
        break;
      case "]":
        pop();
        break;
      default:
        break;
    }
  }
}
