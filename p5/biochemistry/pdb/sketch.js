/*
 * A simple Protein Data Bank molecule viewer.
 * Only handles ATOM/HETATM records and renders a spacefill visualisation
 * by covalent radii in CPK colouring.
 * PDB files taken from http://www.nyu.edu/pages/mathmol/library/
 */

/**
 * An Atom class.
 */
var Atom = function(id, element, x, y, z, rPicometre) {
  this.id = id;
  this.element = element;
  this.x = x;
  this.y = y;
  this.z = z;
  this.rPicometre = rPicometre;
  this.rAngstroms = this.rPicometre / 100;

  isHydrogen = function() {
    return this.element && this.element === "H";
  }
}

/**
 * A Bond class.
 */
var Bond = function(src, dst, length) {
  this.src = src;
  this.dst = dst;
  this.length = length;
}

/**
 * A Molecule class to hold a list of Atoms.
 */
var Molecule = function() {

  /* The list of atoms. */
  this.atoms = [];

  /* The list of bonds between Atoms. */
  this.bonds = [];

  /* The max side length of the bounded set of atoms - used for scaling. */
  this.maxLength = 0;

  /* The center of each axis, used for rotational centering. */
  this.cX = 0;
  this.cY = 0;
  this.cZ = 0;

  /**
   * Add an Atom.
   */
  this.add = function(atom) {
    this.atoms.push(atom);
  }

  /**
   * Compute the bonds automatically by distances.
   */
  this.createBonds = function() {

    for (var i = 0; i < this.atoms.length - 1; i++) {
      for (var j = i + 1; j < this.atoms.length; j++) {
        var src = this.atoms[i];
        var dst = this.atoms[j];

        if (src.id === dst.id || this.bondExists(src, dst)) {
          continue;
        }

        // Distance between atoms.
        var distance = sqrt(
          pow(dst.x - src.x, 2) +
          pow(dst.y - src.y, 2) +
          pow(dst.z - src.z, 2)
        );

        // RasMol https://www.umass.edu/microbio/rasmol/rasbonds.htm

        // > 255 atoms in molecule uses quick bonding:
        // Two atoms are considered bonded when the distance between them
        // is between 0.4 and 1.9 Angstroms, unless one or both atoms are
        // hydrogens, in which case the bonded range is between
        // 0.4 and 1.2 Angstroms.
        // <= 255 atoms in molecule uses slower bonding:
        // Two atoms are considered bonded when the distance between them
        // is between 0.4 Angstroms and the sum of their covalent radii
        // plus 0.56 Angstroms.
        var bondMin = 0.4;
        var bondMax = this.atoms.length > 255 ?
          (src.isHydrogen || dst.isHydrogen ? 1.2 : 1.9) :
          ((src.rAngstroms + dst.rAngstroms) + 0.56);

        if (distance >= bondMin && distance <= bondMax) {
            this.bonds.push(new Bond(src, dst, distance));
        }
      }
    }
  }

  this.bondExists = function(src, dst) {
    for (var i = 0; i < this.bonds.length; i++) {
        var bond = this.bonds[i];
        if ((bond.src.id === src.id && bond.dst.id === dst.id) ||
            (bond.dst.id === src.id && bond.src.id === dst.id)) {
          return true;
        }
    }
    return false;
  }

  /**
   * Called to compute the lengths/centers for this molecule after all
   * atoms added.
   */
  this.finalise = function() {

    this.createBonds();

    var sumX = 0, sumY = 0, sumZ = 0;
    var maxX = 0, maxY = 0, maxZ = 0;

    for (var i = 0; i < this.atoms.length; i++) {
      sumX += this.atoms[i].x;
      sumY += this.atoms[i].y;
      sumZ += this.atoms[i].z;

      maxX =  this.atoms[i].x > maxX ? this.atoms[i].x : maxX;
      maxY =  this.atoms[i].y > maxY ? this.atoms[i].y : maxY;
      maxZ =  this.atoms[i].z > maxZ ? this.atoms[i].z : maxZ;
    }

    this.maxLength = maxX > this.maxLength ? maxX : this.maxLength;
    this.maxLength = maxY > this.maxLength ? maxY : this.maxLength;
    this.maxLength = maxZ > this.maxLength ? maxZ : this.maxLength;

    this.cX = sumX / this.atoms.length;
    this.cY = sumY / this.atoms.length;
    this.cZ = sumZ / this.atoms.length;
  }
}

/**
 * A simple PDB loader and parser.
 * http://www.wwpdb.org/documentation/file-format-content/format33/v3.3.html
 */
function loadPDB(url, callback) {

  var client = new XMLHttpRequest();
  client.open('GET', url);
  client.onreadystatechange = function() {

    if (this.readyState != 4 || this.status != 200) {
      return;
    }

    var lines = client.responseText.split("\n");
    if (lines.length > 0) {
      pdb = lines.join("<br>");
      var mol = new Molecule();
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var recordName = line.substring(1 - 1, 6).trim();
        if (recordName === "ATOM" || recordName === "HETATM") {
          var name = line.substring(13 - 1, 15).trim();
          name = name.replace(/[0-9]/g, '');
          name = symByPDBName(name);
          var x = parseFloat(line.substring(31 - 1, 38).trim());
          var y = parseFloat(line.substring(39 - 1, 46).trim());
          var z = parseFloat(line.substring(47 - 1, 54).trim());
          var ref = refElement(name);
          mol.add(new Atom(i, name, x, y, z, ref.r));
        }
      }

      mol.finalise();
      callback(pdb, mol);
    }
  }

  client.send();
}

/**
 * Reference data.
 * https://en.wikipedia.org/wiki/CPK_coloring
 * https://en.wikipedia.org/wiki/Atomic_radius
 */
var ref = [
  { sym: 'H',  cpk: { r: 255, g: 255, b: 255 }, r: 32 },
  { sym: 'C',  cpk: { r:  80, g:  80, b:  80 }, r: 77 },
  { sym: 'N',  cpk: { r:  34, g:  51, b: 255 }, r: 71 },
  { sym: 'O',  cpk: { r: 255, g:  34, b:   0 }, r: 73 },
  { sym: 'F',  cpk: { r:  31, g: 240, b:  31 }, r: 71 },
  { sym: 'CL', cpk: { r:  31, g: 240, b:  31 }, r: 99 },
  { sym: 'BR', cpk: { r: 153, g:  34, b:   0 }, r: 114 },
  { sym: 'I',  cpk: { r: 169, g: 169, b: 169 }, r: 133 },
  { sym: 'HE', cpk: { r:   0, g: 255, b: 255 }, r: 32 },
  { sym: 'NE', cpk: { r:   0, g: 255, b: 255 }, r: 69 },
  { sym: 'AR', cpk: { r:   0, g: 255, b: 255 }, r: 97 },
  { sym: 'XE', cpk: { r:   0, g: 255, b: 255 }, r: 130 },
  { sym: 'KR', cpk: { r:   0, g: 255, b: 255 }, r: 110 },
  { sym: 'P',  cpk: { r: 255, g: 153, b:   0 }, r: 106 },
  { sym: 'S',  cpk: { r: 255, g: 229, b:  34 }, r: 102 },
  { sym: 'B',  cpk: { r: 255, g: 170, b: 119 }, r: 82 },
  { sym: 'LI', cpk: { r: 119, g:   0, b: 255 }, r: 134 },
  { sym: 'NA', cpk: { r: 119, g:   0, b: 255 }, r: 154 },
  { sym: 'K',  cpk: { r: 119, g:   0, b: 255 }, r: 196 },
  { sym: 'RB', cpk: { r: 119, g:   0, b: 255 }, r: 211 },
  { sym: 'CS', cpk: { r: 119, g:   0, b: 255 }, r: 225 },
  { sym: 'FR', cpk: { r: 119, g:   0, b: 255 }, r: 100 },
  { sym: 'BE', cpk: { r:   0, g: 119, b:   0 }, r: 90 },
  { sym: 'MN', cpk: { r:   0, g: 119, b:   0 }, r: 139 },
  { sym: 'CA', cpk: { r:   0, g: 119, b:   0 }, r: 174 },
  { sym: 'SR', cpk: { r:   0, g: 119, b:   0 }, r: 192 },
  { sym: 'BA', cpk: { r:   0, g: 119, b:   0 }, r: 198 },
  { sym: 'RA', cpk: { r:   0, g: 119, b:   0 }, r: 100 },
  { sym: 'TI', cpk: { r: 153, g: 153, b: 153 }, r: 136 },
  { sym: 'FE', cpk: { r: 221, g: 119, b:   0 }, r: 125 },
  { sym: 'X',  cpk: { r: 221, g: 119, b: 255 }, r: 100 }
];

/**
 * Find a symbol in the ref data for the incoming name. Iterates over the name
 * by removing from the right side to the left as PDB names can have extra
 * data we don't want for this example.
 */
function symByPDBName(name) {
  var iterations = name.length;
  while (iterations > 0) {
    for (var i = 0; i < ref.length; i++) {
      if (name === ref[i].sym) {
        return ref[i].sym;
      }
    }
    name = name.substring(0, name.length - 1);
    iterations--;
  }
}

/**
 * Find reference data by element.
 */
function refElement(element) {
  for (var i = 0; i < ref.length; i++) {
    if (element === ref[i].sym) {
      return ref[i];
    }
  }
}

/** The final molecule, set by the loader. */
var molecule;

/** Display mode */
var mode = "Space Fill";

/** PDB text element */
var pdbText;

/* Y axis vector used for stick mode */
var y;

/**
 * Create a 3D canvas and load a PDB file by default. Offer a select of other
 * molecules. Uses adcworks.com hosted files as an accept-origin header allows
 * all origins for CORS.
 */
function setup() {
  createCanvas(480, 480, WEBGL);

  y = createVector(0, 1, 0);

  createP("");

  var modes = createSelect();
  modes.option('Space Fill');
  modes.option('Bonds');
  modes.changed(function() {
    mode = modes.value();
  });

  var molecules = createSelect();
  molecules.option('drug - adrenaline', 'http://adcworks.com/files/adrenaline.pdb.php');
  molecules.option('carbon - diamond', 'http://adcworks.com/files/diamond.pdb.php');
  molecules.option('carbon - graphite', 'http://adcworks.com/files/graphite.pdb.php');
  molecules.option('protein - ATP', 'http://adcworks.com/files/atp.pdb.php');

  molecules.changed(function() {
    var url = molecules.value();
    loadPDB(url, function(pdb, mol) {
      molecule = mol;
      pdbText.html(pdb);
      console.log(molecule);
    });
  });

  pdbText = createP("");

  loadPDB('http://adcworks.com/files/adrenaline.pdb.php', function(pdb, mol) {
    molecule = mol;
    pdbText.html(pdb);
    console.log(molecule);
  });
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

    scale(width / (molecule.maxLength * 3));

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

    scale(width / (molecule.maxLength * 3));

    /*
    for (var i = 0; i < molecule.atoms.length; i++) {
      var atom = molecule.atoms[i];
      push();
      translate(atom.x - molecule.cX, atom.y - molecule.cY, atom.z - molecule.cZ);
      sphere(0.2);
      pop();
    }
    */

    for (var i = 0; i < molecule.bonds.length; i++) {
      var src = molecule.bonds[i].src;
      var dst = molecule.bonds[i].dst;
      stick(src.element, src, dst);
      stick(dst.element, dst, src);
    }
  }
}

/**
 * Draw a cylinder between 2 atoms.
 * Rotational math algorithm from:
 * http://mufthas.blogspot.de/2010/03/how-to-draw-cylinder-in-java-3d-between.html
 */
function stick(element, src, dst) {

  // Create a vector pointing from src to dst and normalize it
  var v = createVector(dst.x - src.x, dst.y - src.y, dst.z - src.z);
  v.normalize();

  var len = v.mag() / 2;

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
    src.x - molecule.cX + (v.x / 4),
    src.y - molecule.cY + (v.y / 4),
    src.z - molecule.cZ + (v.z / 4)
  );

  push();
  translate(origin.x, origin.y, origin.z);
  rotate(theta, c);
  var ref = refElement(element);
  if (ref) {
    ambientMaterial(ref.cpk.r, ref.cpk.g, ref.cpk.b);
    cylinder(0.1, len);
  }
  pop();
}
