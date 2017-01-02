/*
 * An implementation of Example 7 Fractal Plant L-System at
 * https://en.wikipedia.org/wiki/L-system
 */

var axiom = "X";

var rules = [
  { src: "X", dst: "F-[[X]+X]+F[+FX]-X" },
  { src: "F", dst: "FF" }
];

var sentence = axiom;

/**
 * Implement the generation function to expand the axiom.
 */
function generateTree(gens, blen, ang) {

  generations = gens;
  branchLength = blen;
  angle = ang;

  var str = "";

  for (var g = 0; g < generations; g++) {

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

  return str;
}

/**
 * Render the sentence to the canvas according to the rules for drawing.
 * Started to the left a bit as the tree tends to produce to the right.
 */
function renderTree(str) {

  for (var i = 0; i < str.length; i++) {
    var char = str.charAt(i);
    switch (char) {
      case "F":
        strokeWeight(2);
        stroke(17, 12, 52);
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
