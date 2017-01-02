function loadAvailableMolecules() {
  console.log("Loading available molecules ...");
  jQuery.getJSON('http://www.adcworks.com/api/pdb', function(data) {
    $.each(data, function(i, name) {
      availableMolecules.option(name);
    });
  });
}

/**
 * A simple PDB loader and parser.
 * http://www.wwpdb.org/documentation/file-format-content/format33/v3.3.html
 */
function loadPDB(name, callback) {
  console.log("Loading " + name + " ...");
  jQuery.get('http://www.adcworks.com/api/pdb/' + name, function(data) {

    var lines = data.split("\n");
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
  }, 'text');
}
