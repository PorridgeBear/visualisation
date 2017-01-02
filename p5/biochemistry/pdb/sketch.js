/* The final molecule, set by the loader. */
var molecule;

/* Display mode */
var mode = "Space Fill";

/* Select **/
var availableMolecules;

/* PDB text element */
var pdbText;

/* Scale slider for zooming */
var scaleSider;

/* Y axis vector used for stick mode */
var y;

/* Bond geometry thickness */
var bondsThickness = 0.3;

/** A callback for when molecules selected and loaded - configures UI */
var loadedMoleculeCallback = function(pdb, mol) {
  molecule = mol;
  pdbText.html(pdb);
  console.log(molecule);
};

/** Start by loading molecules from the network */
jQuery(document).ready(function() {
  loadAvailableMolecules();
});

/**
 * Create a 3D canvas and load a PDB file by default. Offer a select of other
 * molecules. Uses adcworks.com hosted files as an accept-origin header allows
 * all origins for CORS.
 */
function setup() {
  createCanvas(480, 480, WEBGL);

  y = createVector(0, 1, 0);

  createP("");

  scaleSider = createSlider(1, 6, 3, 1);

  var modes = createSelect();
  modes.option('Space Fill');
  modes.option('Bonds');
  modes.changed(function() {
    mode = modes.value();
  });

  availableMolecules = createSelect();
  availableMolecules.changed(function() {
    loadPDB(availableMolecules.value(), loadedMoleculeCallback);
  });

  pdbText = createP("");
}

/**
 * Render the molecule in 3D.
 */
function draw() {
  if (!molecule) {
    return;
  }

  orbitControl();

  background(0);
  ambientLight(90);
  directionalLight(200, 200, 200, 0, 0, 20);

  if (mode === "Space Fill") {

    scale(width / (molecule.maxLength * scaleSider.value()));

    for (var i = 0; i < molecule.atoms.length; i++) {
      var atom = molecule.atoms[i];
      push();
      translate(atom.x - molecule.cX, atom.y - molecule.cY, atom.z - molecule.cZ);
      var ref = refElement(atom.element);
      if (ref) {
        ambientMaterial(ref.cpk.r, ref.cpk.g, ref.cpk.b);
        sphere(ref.r / 80);
      }
      pop();
    }

  } else if (mode === "Bonds") {

    scale(width / (molecule.maxLength * scaleSider.value()));

    for (var i = 0; i < molecule.atoms.length; i++) {
      var atom = molecule.atoms[i];
      push();
      translate(atom.x - molecule.cX, atom.y - molecule.cY, atom.z - molecule.cZ);
      var ref = refElement(atom.element);
      if (ref) {
        ambientMaterial(ref.cpk.r, ref.cpk.g, ref.cpk.b);
        var r = ref.r / 200;
        if (r < bondsThickness) { r = bondsThickness };
        sphere(r);
      }
      pop();
    }

    for (var i = 0; i < molecule.bonds.length; i++) {
      var src = molecule.bonds[i].src;
      var dst = molecule.bonds[i].dst;
      var distance = molecule.bonds[i].distance;
      stick(src.element, src, dst, distance);
      stick(dst.element, dst, src, distance);
    }
  }
}

/**
 * Draw a cylinder between 2 atoms.
 * Rotational math algorithm from:
 * http://mufthas.blogspot.de/2010/03/how-to-draw-cylinder-in-java-3d-between.html
 */
function stick(element, src, dst, distance) {

  // Create a vector pointing from src to dst and normalize it
  var v = createVector(dst.x - src.x, dst.y - src.y, dst.z - src.z);

  // Compute values pre-normalization for bond drawing
  var v2 = v.copy();
  var vL = v.mag() / 2;
  var v2 = p5.Vector.div(v, 4);

  v.normalize();

  // Find the angle to rotate
  var theta = acos(p5.Vector.dot(y, v));
  var vxz = createVector(v.x, 0, y.z);
  if (p5.Vector.dot(vxz, v) > 0) {
    theta = -theta;
  }

  // Find the axis of rotation
  var c = p5.Vector.cross(y, v);
  c.normalize();

  // Where to draw the cylinder from
  var origin = createVector(
    src.x - molecule.cX + v2.x,
    src.y - molecule.cY + v2.y,
    src.z - molecule.cZ + v2.z
  );

  push();
  translate(origin.x, origin.y, origin.z);
  rotate(theta, c);
  var ref = refElement(element);
  if (ref) {
    ambientMaterial(ref.cpk.r, ref.cpk.g, ref.cpk.b);
    //cylinder(0.1, vL);
    box(bondsThickness, vL); // SO much faster and not that noticeable as matchsticks
  }
  pop();
}
