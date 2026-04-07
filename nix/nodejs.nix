{ pkgs, pkgsLinuxAmd64 ? pkgs, pkgsLinuxArm64 ? pkgs }: rec {
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

  mkLinuxInstallPhase = { targetPkgs, interpreter }: ''
    mkdir -p $out
    cp -r * $out/
    patchelf \
      --set-interpreter ${interpreter} \
      --set-rpath ${pkgs.lib.makeLibraryPath (linuxLibs targetPkgs)} \
      $out/bin/node
  '';

  aarch64-darwin = pkgs.stdenv.mkDerivation {
      name = "nodejs-25.9.0-darwin-arm64";
      src = pkgs.fetchurl {
        url = "https://nodejs.org/dist/v25.9.0/node-v25.9.0-darwin-arm64.tar.gz";
        sha256 = "sha256-5HnzxGnT2TA6RPAKjqN6N4g5XRcbuAWcSKS7vS43G1k=";
      };
      inherit (common) installPhase;
  };

  aarch64-linux = pkgs.stdenv.mkDerivation {
      name = "nodejs-25.9.0-linux-arm64";
      src = pkgs.fetchurl {
        url = "https://nodejs.org/dist/v25.9.0/node-v25.9.0-linux-arm64.tar.gz";
        sha256 = "sha256-j7QoMwG4xyD8nxi///D2WecswU0M8geju0EYCKqnOlc=";
      };
      nativeBuildInputs = [ pkgs.patchelf ];
      installPhase = mkLinuxInstallPhase {
        targetPkgs = pkgsLinuxArm64;
        interpreter = "${pkgsLinuxArm64.glibc}/lib/ld-linux-aarch64.so.1";
      };
  };

  x86_64-linux = pkgs.stdenv.mkDerivation {
      name = "nodejs-25.9.0-linux-x64";
      src = pkgs.fetchurl {
        url = "https://nodejs.org/dist/v25.9.0/node-v25.9.0-linux-x64.tar.gz";
        sha256 = pkgs.lib.fakeSha256;
      };
      nativeBuildInputs = [ pkgs.patchelf ];
      installPhase = mkLinuxInstallPhase {
        targetPkgs = pkgsLinuxAmd64;
        interpreter = "${pkgsLinuxAmd64.glibc}/lib/ld-linux-x86-64.so.2";
      };
  };

  x86_64-darwin = pkgs.stdenv.mkDerivation {
      name = "nodejs-25.9.0-darwin-x64";
      src = pkgs.fetchurl {
        url = "https://nodejs.org/dist/v25.9.0/node-v25.9.0-darwin-x64.tar.gz";
        sha256 = pkgs.lib.fakeSha256;
      };
      inherit (common) installPhase;
  };
}
