{ pkgs, pkgsLinuxAmd64, pkgsLinuxArm64 }: rec {
  # Shared libraries needed by the prebuilt Node.js Linux binaries (dynamically
  # linked against glibc). Include these in the OCI image contents alongside the
  # nodejs derivation so the binary can resolve them at runtime.
  linuxLibs = targetPkgs: [ targetPkgs.glibc targetPkgs.stdenv.cc.cc.lib ];

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
    '';

  aarch64-darwin = pkgs.stdenv.mkDerivation {
      name = "nodejs-26.4.0-darwin-arm64";
      src = pkgs.fetchurl {
        url = "https://nodejs.org/dist/v26.4.0/node-v26.4.0-darwin-arm64.tar.gz";
        sha256 = "sha256-T0+8rPax/xqV3u26e9ey157+yqU6jssFMFRtyQY/77w=";
      };
      inherit (common) installPhase;
  };

  aarch64-linux = mkLinuxDerivation {
      name = "nodejs-26.4.0-linux-arm64";
      src = pkgs.fetchurl {
        url = "https://nodejs.org/dist/v26.4.0/node-v26.4.0-linux-arm64.tar.gz";
        sha256 = "sha256-dz2exnJmg4Jw3cEFwlSK6Kr/KLyP5vNMVdEJQEPEFl4=";
      };
      targetPkgs = pkgsLinuxArm64;
      interpreter = "${pkgsLinuxArm64.glibc}/lib/ld-linux-aarch64.so.1";
  };

  x86_64-linux = mkLinuxDerivation {
      name = "nodejs-26.4.0-linux-x64";
      src = pkgs.fetchurl {
        url = "https://nodejs.org/dist/v26.4.0/node-v26.4.0-linux-x64.tar.gz";
        sha256 = "sha256-8iHasw0OnVRDMvBvvuLGIYbJfYZNXKyEgtujTx44uNw=";
      };
      targetPkgs = pkgsLinuxAmd64;
      interpreter = "${pkgsLinuxAmd64.glibc}/lib/ld-linux-x86-64.so.2";
  };

  x86_64-darwin = pkgs.stdenv.mkDerivation {
      name = "nodejs-26.4.0-darwin-x64";
      src = pkgs.fetchurl {
        url = "https://nodejs.org/dist/v26.4.0/node-v26.4.0-darwin-x64.tar.gz";
        sha256 = pkgs.lib.fakeSha256;
      };
      inherit (common) installPhase;
  };
}
