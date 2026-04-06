{ pkgs }: rec {
  lockfile = builtins.fromJSON (builtins.readFile ../package-lock.json);


  packages = pkgs.lib.filterAttrs
    (path: pkg: path != "" && pkg ? resolved && pkg ? integrity)
    lockfile.packages;

  fetchTarball = _path: npmPackage: pkgs.fetchurl {
    url = npmPackage.resolved;
    hash = npmPackage.integrity;
  };

  tarballs = pkgs.lib.mapAttrs fetchTarball packages;

  stripPrefix = path:
    pkgs.lib.removePrefix "node_modules/" path;

  node_modules = pkgs.runCommand "node-modules" {
    nativeBuildInputs = [ pkgs.nodejs_24 ];
  } ''
    set -euo pipefail
    mkdir -p $out/node_modules
    ${pkgs.lib.concatStringsSep "\n" (pkgs.lib.mapAttrsToList (path: tarball: ''
      echo "extracting ${path}"
      mkdir -p "$out/${path}"
      tar -xzf ${tarball} -C "$out/${path}" --strip-components=1 --no-same-permissions --mode='u=rwX,go=rX' --delay-directory-restore
      chmod -R u+rwX "$out/${path}"
    '') tarballs)}

    echo "applying patches..."
    cd $out
    cp ${../package.json} package.json
    cp -r ${../patches} patches
    chmod -R u+rwX patches
    node node_modules/patch-package/index.js
  '';
}