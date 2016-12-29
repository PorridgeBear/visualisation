/*
 * An implementation of Example 7 Fractal Plant L-System at
 * https://en.wikipedia.org/wiki/L-system
 */

var axiom = "X";

var rules = [
  { src: "X", dst: "F−[[X]+X]+F[+FX]−X" },
  { src: "F", dst: "FF" }
];

var generations = 6;
var sentence = axiom;
var branchLength = 4;
var angle = .4363; // 25 degrees in radians

/**
 * Create a drawing canvas, create generations of the sentence and render.
 */
function setup() {
  createCanvas(600, 600);

  for (var i = 0; i < generations; i++) {
    generate();
  }

  background(0);
  stroke(255);

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

  translate(100, height);

  for (var i = 0; i < sentence.length; i++) {
    var char = sentence.charAt(i);
    switch (char) {
      case "F":
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
