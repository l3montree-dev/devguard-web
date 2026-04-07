{ pkgs, pkgsLinuxAmd64 ? pkgs, pkgsLinuxArm64 ? pkgs }: rec {
  # Shared libraries needed by the prebuilt Node.js Linux binaries (dynamically
  # linked against glibc). Include these in the OCI image contents alongside the
  # nodejs derivation so the binary can resolve them at runtime.
  linuxLibs = targetPkgs:
    [ targetPkgs.glibc targetPkgs.stdenv.cc.cc.lib ]
    ++ pkgs.lib.optionals (targetPkgs ? libatomic) [ targetPkgs.libatomic ];

  common = {
    installPhase = ''
      mkdir -p $out
      cp -r * $out/
    '';
  };

  mkLinuxDerivation = { name, src, targetPkgs }: pkgs.stdenv.mkDerivation {
    inherit name src;
    nativeBuildInputs = [ pkgs.autoPatchelfHook ];
    buildInputs = linuxLibs targetPkgs;
    installPhase = common.installPhase;
  };

  aarch64-darwin = pkgs.stdenv.mkDerivation {
      name = "nodejs-25.9.0-darwin-arm64";
      src = pkgs.fetchurl {
        url = "https://nodejs.org/dist/v25.9.0/node-v25.9.0-darwin-arm64.tar.gz";
        sha256 = "sha256-5HnzxGnT2TA6RPAKjqN6N4g5XRcbuAWcSKS7vS43G1k=";
      };
      inherit (common) installPhase;
  };

  aarch64-linux = mkLinuxDerivation {
      name = "nodejs-25.9.0-linux-arm64";
      src = pkgs.fetchurl {
        url = "https://nodejs.org/dist/v25.9.0/node-v25.9.0-linux-arm64.tar.gz";
        sha256 = "sha256-j7QoMwG4xyD8nxi///D2WecswU0M8geju0EYCKqnOlc=";
      };
      targetPkgs = pkgsLinuxArm64;
  };

  x86_64-linux = mkLinuxDerivation {
      name = "nodejs-25.9.0-linux-x64";
      src = pkgs.fetchurl {
        url = "https://nodejs.org/dist/v25.9.0/node-v25.9.0-linux-x64.tar.gz";
        sha256 = "sha256-E05VskCESKIZdg/gTcRNaFH53op5VJAh/9hw6Qgtnns=";
      };
      targetPkgs = pkgsLinuxAmd64;
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
