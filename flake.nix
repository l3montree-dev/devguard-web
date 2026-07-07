{
  description = "DevGuard Web";

  nixConfig = {
    extra-substituters = [ "https://nix.garage.l3montree.cloud" ];
    extra-trusted-public-keys = [ "nix.garage.l3montree.cloud:MGlzfPQKA91/zxw91CN+GP7NpjAAwmKvWXlDYgeeI8k=" ];
  };

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    flake-utils.url = "github:numtide/flake-utils";
    sbomnix.url = "github:tiiuae/sbomnix";
    sbomnix.inputs.nixpkgs.follows = "nixpkgs"; # share the same nixpkgs pin
    bun2nix.url = "github:nix-community/bun2nix";
    bun2nix.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { self, nixpkgs, flake-utils, sbomnix, bun2nix }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ bun2nix.overlays.default ];
        };
        sbomnixPkgs = sbomnix.packages.${system};
        pkgsLinuxAmd64 = import nixpkgs { system = "x86_64-linux"; overlays = [ bun2nix.overlays.default ]; };
        pkgsLinuxArm64 = import nixpkgs { system = "aarch64-linux"; overlays = [ bun2nix.overlays.default ]; };

        # `sharp` and `@next/swc` ship native addons, so node_modules must be
        # built natively for the target platform (no cross-installing from a
        # different host arch).
        mkDevguardWeb = targetPkgs: targetPkgs.stdenv.mkDerivation {
          name = "devguard-web";
          src = targetPkgs.lib.fileset.toSource {
            root = ./.;
            fileset = targetPkgs.lib.fileset.unions [
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
          nativeBuildInputs = [ targetPkgs.bun targetPkgs.cacert ];
          buildPhase = ''
            export GIT_COMMIT_SHA="${self.rev or "dev"}"
            cp -r ${(import ./nix/bun-packages.nix { pkgs = targetPkgs; }).patchedNodeModules}/node_modules ./node_modules
            chmod -R u+w ./node_modules
            bun ./node_modules/next/dist/bin/next build --turbopack
            cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
          '';
          installPhase = ''
            mkdir -p $out
            # .next/node_modules/ is a build-time artifact Next.js 16 uses for module
            # deduplication during the build (via symlinks back into the source tree).
            # It is not part of the standalone runtime output (.next/standalone/) and
            # its dangling symlinks would fail Nix's noBrokenSymlinks check.
            rm -rf .next/node_modules
            cp -r .next $out/
          '';
        };

        devguardWeb = mkDevguardWeb pkgs;

        mkDevguardWebOCI = targetPkgs: pkgs.dockerTools.buildLayeredImage {
          name = "devguard-web-oci";
          tag = "latest";
          contents = [ targetPkgs.bun targetPkgs.cacert ];
          fakeRootCommands = ''
            # Copy standalone output to /app (outside Nix store) so Next.js
            # can write its cache at runtime. The Nix store is read-only.
            mkdir -p app
            cp -r ${mkDevguardWeb targetPkgs}/.next/standalone/. app/
            mkdir -p app/.next/cache
            chown -R 53111:53111 app
          '';
          config = {
            Cmd = [ "${targetPkgs.bun}/bin/bun" "/app/server.js" ];
            User = "53111:53111";
            Expose = [ "3000" ];
          };
        };
      in
      {
        packages = {
          default = devguardWeb;
          node_modulesArm64 = (import ./nix/bun-packages.nix { pkgs = pkgsLinuxArm64; }).patchedNodeModules;
          node_modulesAmd64 = (import ./nix/bun-packages.nix { pkgs = pkgsLinuxAmd64; }).patchedNodeModules;
          "devguard-web-amd64" = mkDevguardWebOCI pkgsLinuxAmd64;
          "devguard-web-arm64" = mkDevguardWebOCI pkgsLinuxArm64;
        };
      }
    );
}