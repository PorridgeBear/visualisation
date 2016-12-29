/*
 * A simple Protein Data Bank molecule viewer.
 * Only handles ATOM/HETATM records and renders a spacefill visualisation
 * by covalent radii in CPK colouring.
 * PDB files taken from http://www.nyu.edu/pages/mathmol/library/
 */

/**
 * An Atom class.
 */
var Atom = function(element, x, y, z) {
  this.element = element;
  this.x = x;
  this.y = y;
  this.z = z;
}

/**
 * A Molecule class to hold a list of Atoms.
 */
var Molecule = function() {

  /* The list of atoms. */
  this.atoms = [];

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
   * Called to compute the lengths/centers for this molecule after all
   * atoms added.
   */
  this.finalise = function() {

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
          mol.add(new Atom(name, x, y, z));
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

/** PDB text element */
var pdbText;

/**
 * Create a 3D canvas and load a PDB file by default. Offer a select of other
 * molecules. Uses adcworks.com hosted files as an accept-origin header allows
 * all origins for CORS.
 */
function setup() {
  createCanvas(480, 480, WEBGL);

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
    });
  });

  pdbText = createP("");

  loadPDB('http://adcworks.com/files/adrenaline.pdb.php', function(pdb, mol) {
    molecule = mol;
    pdbText.html(pdb);
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

  ambientLight(90);
  directionalLight(200, 200, 200, 0, 0, 20);

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
}
