{
  description = "DevGuard Web";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    flake-utils.url = "github:numtide/flake-utils";
    sbomnix.url = "github:tiiuae/sbomnix";
    sbomnix.inputs.nixpkgs.follows = "nixpkgs"; # share the same nixpkgs pin
  };

  outputs = { self, nixpkgs, flake-utils, sbomnix }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        sbomnixPkgs = sbomnix.packages.${system};
        npmPackages = (import ./nix/npm-packages.nix { inherit pkgs; });

        devguardWeb = pkgs.stdenv.mkDerivation {
          name = "devguard-web";
          src = pkgs.lib.fileset.toSource {
            root = ./.;
            fileset = pkgs.lib.fileset.unions [
              ./src
              ./public
              ./next.config.js
              ./postcss.config.js
              ./tailwind.config.js
              ./tsconfig.json
              ./package.json
              ./components.json
              ./sentry.server.config.ts
            ];
          };
          nativeBuildInputs = [ pkgs.nodejs_24 pkgs.cacert ];
          buildPhase = ''
            cp -r ${npmPackages.node_modules}/node_modules ./node_modules
            chmod -R u+w ./node_modules
            ./node_modules/next/dist/bin/next build
            cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
          '';
          installPhase = ''
            mkdir -p $out
            cp -r .next $out/
          '';
        };

        # Use native pkgs when host matches target for cache hits; fall back to pkgsCross.
        amd64Pkgs = nixpkgs.legacyPackages.x86_64-linux;
        arm64Pkgs = nixpkgs.legacyPackages.aarch64-linux;

        mkDevguardWebOCI = nodePkgs: pkgs.dockerTools.buildLayeredImage {
          name = "devguard-web-oci";
          tag = "latest";
          contents = [ nodePkgs.nodejs_24 nodePkgs.cacert ];
          fakeRootCommands = ''
            # Copy standalone output to /app (outside Nix store) so Next.js
            # can write its cache at runtime. The Nix store is read-only.
            mkdir -p app
            cp -r ${devguardWeb}/.next/standalone/. app/
            mkdir -p app/.next/cache
            chown -R 53111:53111 app
          '';
          config = {
            Cmd = [ "${nodePkgs.nodejs_24}/bin/node" "/app/server.js" ];
            User = "53111:53111";
            Expose = [ "3000" ];
          };
        };
      in
      {
        packages.default = devguardWeb;
        packages.node_modules = npmPackages.node_modules;
        packages."devguard-web-amd64" = mkDevguardWebOCI amd64Pkgs;
        packages."devguard-web-arm64" = mkDevguardWebOCI arm64Pkgs;
      }
    );
}