{ pkgs, pkgsLinuxAmd64, pkgsLinuxArm64 }: rec {
  # Shared libraries needed by the prebuilt Node.js Linux binaries (dynamically
  # linked against glibc). Include these in the OCI image contents alongside the
  # nodejs derivation so the binary can resolve them at runtime.
  linuxLibs = targetPkgs: [ targetPkgs.glibc targetPkgs.stdenv.cc.cc.lib ];
  nodeVersion = "26.12.1";
  common = {
    installPhase = ''
      mkdir -p $out
      cp -r * $out/
    '';
  };

  # Uses the target platform's runCommand so patchelf runs on the correct Linux
  # builder (not Darwin), preserving ELF symbol versioning correctly.
  mkLinuxDerivation = { name, src, targetPkgs, interpreter }:
    targetPkgs.runCommand name {
      inherit src;
      nativeBuildInputs = [ targetPkgs.patchelf ];
    } ''
      mkdir -p $out
      cd $out
      tar -xzf $src --strip-components=1
      patchelf \
        --set-interpreter ${interpreter} \
        --set-rpath ${pkgs.lib.makeLibraryPath (linuxLibs targetPkgs)} \
        bin/node
      # remove npm and npx
      rm -rf bin/npm bin/npx lib
    '';

  aarch64-darwin = pkgs.stdenv.mkDerivation {
      name = "nodejs-${nodeVersion}-darwin-arm64";
      src = pkgs.fetchurl {
        url = "https://nodejs.org/dist/v${nodeVersion}/node-v${nodeVersion}-darwin-arm64.tar.gz";
        sha256 = "sha256-GQHVOZEsAq+hDRzBJpQ6iFWn7t6+gwEZRjRw215sWeg=";
      };
      inherit (common) installPhase;
  };

  aarch64-linux = mkLinuxDerivation {
      name = "nodejs-${nodeVersion}-linux-arm64";
      src = pkgs.fetchurl {
        url = "https://nodejs.org/dist/v${nodeVersion}/node-v${nodeVersion}-linux-arm64.tar.gz";
        sha256 = "sha256-psAa9FndiXKrP7CO5dqBJE0muoxJRKYtW7uoxZeuFU8=";
      };
      targetPkgs = pkgsLinuxArm64;
      interpreter = "${pkgsLinuxArm64.glibc}/lib/ld-linux-aarch64.so.1";
  };

  x86_64-linux = mkLinuxDerivation {
      name = "nodejs-${nodeVersion}-linux-x64";
      src = pkgs.fetchurl {
        url = "https://nodejs.org/dist/v${nodeVersion}/node-v${nodeVersion}-linux-x64.tar.gz";
        sha256 = "sha256-D9Hrd3BZj1KiGZXt9u01/GkEAPpDfCOGrzKVGekUMTI=";
      };
      targetPkgs = pkgsLinuxAmd64;
      interpreter = "${pkgsLinuxAmd64.glibc}/lib/ld-linux-x86-64.so.2";
  };

  x86_64-darwin = pkgs.stdenv.mkDerivation {
      name = "nodejs-${nodeVersion}-darwin-x64";
      src = pkgs.fetchurl {
        url = "https://nodejs.org/dist/v${nodeVersion}/node-v${nodeVersion}-darwin-x64.tar.gz";
        sha256 = "sha256-1CkzlMlFok5k4AtBd78HXslj6nCzTR0uJL1KcXFtM08=";
      };
      inherit (common) installPhase;
  };
}
