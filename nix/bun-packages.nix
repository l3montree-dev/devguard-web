{ pkgs }: rec {
  # After changing bun.lock, regenerate nix/bun.nix with:
  #   make bun-nix
  node_modules = pkgs.stdenvNoCC.mkDerivation {
    name = "bun-node-modules";
    src = pkgs.lib.fileset.toSource {
      root = ../.;
      fileset = pkgs.lib.fileset.unions [
        ../package.json
        ../bun.lock
      ];
    };
    nativeBuildInputs = [ pkgs.bun pkgs.bun2nix.hook ];
    bunDeps = pkgs.bun2nix.fetchBunDeps {
      bunNix = ./bun.nix;
    };
    dontConfigure = true;
    buildPhase = ''
      export HOME=$TMPDIR
      bun install --frozen-lockfile --ignore-scripts
    '';
    installPhase = ''
      mkdir -p $out
      mv node_modules $out/
    '';
  };

  patchedNodeModules = pkgs.runCommand "node-modules-patched" {
    nativeBuildInputs = [ pkgs.bun ];
  } ''
    set -euo pipefail
    mkdir -p $out
    cp -r ${node_modules}/node_modules $out/node_modules
    cp ${../package.json} $out/package.json
    cp -r ${../patches} $out/patches
    cd $out
    chmod -R u+rwX patches node_modules
    bun node_modules/patch-package/index.js --error-on-fail
  '';
}
