{ pkgs }: rec {
  # Single fixed-output derivation for all npm deps.
  # After changing package-lock.json, update this hash by running:
  #   nix build .#devguard-web-amd64 2>&1 | grep "got:"
  npmDeps = pkgs.fetchNpmDeps {
    src = pkgs.lib.fileset.toSource {
      root = ../.;
      fileset = pkgs.lib.fileset.unions [
        ../package.json
        ../package-lock.json
      ];
    };
<<<<<<< HEAD
    hash = "sha256-S+Pn/Yza1A15TPdWK9Am4m0g9ZoyyU0+Y0Da+WsJUx4=";
=======
    hash = "sha256-/x3w8exgBPXerDJ/5G+dQU90ToNeHoD1yQ+ZdcAYI2k=";
>>>>>>> main
  };

  node_modules = pkgs.runCommand "node-modules" {
    nativeBuildInputs = [ pkgs.nodejs_26 ];
  } ''
    export HOME=$TMPDIR
    cp ${../package.json} package.json
    cp ${../package-lock.json} package-lock.json
    npm ci --cache ${npmDeps} --offline --ignore-scripts --legacy-peer-deps
    mkdir -p $out
    mv node_modules $out/
  '';

  patchedNodeModules = pkgs.runCommand "node-modules-patched" {
    nativeBuildInputs = [ pkgs.nodejs_26 ];
  } ''
    set -euo pipefail
    mkdir -p $out
    cp -r ${node_modules}/node_modules $out/node_modules
    cp ${../package.json} $out/package.json
    cp -r ${../patches} $out/patches
    cd $out
    chmod -R u+rwX patches node_modules
    node node_modules/patch-package/index.js --error-on-fail
  '';
}
