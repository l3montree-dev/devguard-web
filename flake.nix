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
        pkgsLinuxAmd64 = nixpkgs.legacyPackages.x86_64-linux;
        pkgsLinuxArm64 = nixpkgs.legacyPackages.aarch64-linux;
        nodejs = import ./nix/nodejs.nix { inherit pkgs pkgsLinuxAmd64 pkgsLinuxArm64; };
        nodejsLinuxLibs = nodejs.linuxLibs;

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
          nativeBuildInputs = [ nodejs.${system} pkgs.cacert ];
          buildPhase = ''
            cp -r ${npmPackages.patchedNodeModules}/node_modules ./node_modules
            chmod -R u+w ./node_modules
            node ./node_modules/next/dist/bin/next build
            cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
          '';
          installPhase = ''
            mkdir -p $out
            cp -r .next $out/
          '';
        };

        nodejsLinuxAmd64 = nodejs.x86_64-linux;
        nodejsLinuxArm64 = nodejs.aarch64-linux;

        mkDevguardWebOCI = linuxPkgs: node: pkgs.dockerTools.buildLayeredImage {
          name = "devguard-web-oci";
          tag = "latest";
          contents = [ node pkgs.cacert ] ++ (nodejsLinuxLibs linuxPkgs);
          fakeRootCommands = ''
            # Copy standalone output to /app (outside Nix store) so Next.js
            # can write its cache at runtime. The Nix store is read-only.
            mkdir -p app
            cp -r ${devguardWeb}/.next/standalone/. app/
            mkdir -p app/.next/cache
            chown -R 53111:53111 app
          '';
          config = {
            Cmd = [ "${node}/bin/node" "/app/server.js" ];
            User = "53111:53111";
            Expose = [ "3000" ];
          };
        };
      in
      {
        packages = {
          default = devguardWeb;
          node_modulesArm64 = (import ./nix/npm-packages.nix { pkgs = pkgsLinuxArm64; }).node_modules;
          node_modulesAmd64 = (import ./nix/npm-packages.nix { pkgs = pkgsLinuxAmd64; }).node_modules;
          "devguard-web-amd64" = mkDevguardWebOCI pkgsLinuxAmd64 nodejsLinuxAmd64;
          "devguard-web-arm64" = mkDevguardWebOCI pkgsLinuxArm64 nodejsLinuxArm64;
        };
      }
    );
}