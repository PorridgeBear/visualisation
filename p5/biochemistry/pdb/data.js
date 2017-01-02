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
