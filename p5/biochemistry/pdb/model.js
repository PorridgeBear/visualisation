/*
 * A simple Protein Data Bank molecule viewer.
 * Only handles ATOM/HETATM records and renders a spacefill visualisation
 * by covalent radii in CPK colouring OR sticks mode (bonds).
 * PDB files taken from http://www.nyu.edu/pages/mathmol/library/
 * @author Allistair Crossley www.adcworks.com
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

  this.isHydrogen = function() {
    return this.element && this.element === "H";
  }
}

/**
 * A Bond class.
 */
var Bond = function(src, dst, distance) {
  this.src = src;
  this.dst = dst;
  this.distance = distance;
}

/**
 * A Molecule class to hold a list of Atoms and its Bonds.
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
          (src.isHydrogen() || dst.isHydrogen() ? 1.2 : 1.9) :
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
