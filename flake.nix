{
  description = "DevGuard Web";

  nixConfig = {
    extra-substituters = [ "https://nix.garage.l3montree.cloud" ];
    extra-trusted-public-keys = [ "nix.garage.l3montree.cloud:MGlzfPQKA91/zxw91CN+GP7NpjAAwmKvWXlDYgeeI8k=" ];
  };

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        npmPackages = (import ./nix/npm-packages.nix { inherit pkgs; });
        pkgsLinuxAmd64 = nixpkgs.legacyPackages.x86_64-linux;
        pkgsLinuxArm64 = nixpkgs.legacyPackages.aarch64-linux;
        nodejs = import ./nix/nodejs.nix { inherit pkgs pkgsLinuxAmd64 pkgsLinuxArm64; };
        nodejsLinuxLibs = nodejs.linuxLibs;
        devguardWebSBOM = import ./nix/sbom-lib.nix { inherit pkgs; };

        # relevant for sourcemaps
        ciTag =
          let
            github = if builtins.getEnv "GITHUB_REF_TYPE" == "tag"
                     then builtins.getEnv "GITHUB_REF_NAME" else "";
            gitlab = builtins.getEnv "CI_COMMIT_TAG";
          in if github != "" then github else gitlab;
        releaseName = if ciTag != "" then ciTag else "main";

        devguardWeb = pkgs.stdenv.mkDerivation {
          name = "devguard-web";
          src = pkgs.lib.fileset.toSource {
            root = ./.;
            fileset = pkgs.lib.fileset.difference
              (pkgs.lib.fileset.unions [
                ./src
                ./public
                ./next.config.js
                ./postcss.config.js
                ./tailwind.config.js
                ./tsconfig.json
                ./package.json
                ./components.json
                ./sentry.server.config.ts
              ])
              (pkgs.lib.fileset.fileFilter
                (file: pkgs.lib.strings.hasSuffix ".test.ts" file.name || pkgs.lib.strings.hasSuffix ".test.tsx" file.name)
                ./src);
          };
          nativeBuildInputs = [ nodejs.${system} pkgs.cacert ];
          buildPhase = ''
            export NODE_OPTIONS="--max-old-space-size=4096"
            export GIT_COMMIT_SHA="${self.rev or "main"}"
            # sourcemap relevant
            export NEXT_PUBLIC_VERSION="${releaseName}"
            cp -r ${npmPackages.patchedNodeModules}/node_modules ./node_modules
            chmod -R u+w ./node_modules
            node ./node_modules/next/dist/bin/next build --turbopack
            cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
            echo -n "$NEXT_PUBLIC_VERSION" > .next/RELEASE
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

        nodejsLinuxAmd64 = nodejs.x86_64-linux;
        nodejsLinuxArm64 = nodejs.aarch64-linux;

        mkDevguardWebOCI = linuxPkgs: node: pkgs.dockerTools.buildLayeredImage {
          name = "devguard-web-oci";
          tag = "latest";
          # devguardWebSBOM lands at /sboms/devguard-web.json (default --sbomPath).
          contents = [ node pkgs.cacert devguardWebSBOM ] ++ (nodejsLinuxLibs linuxPkgs);
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
          sbom = devguardWebSBOM;
          node_modulesArm64 = (import ./nix/npm-packages.nix { pkgs = pkgsLinuxArm64; }).patchedNodeModules;
          node_modulesAmd64 = (import ./nix/npm-packages.nix { pkgs = pkgsLinuxAmd64; }).patchedNodeModules;
          "devguard-web-amd64" = mkDevguardWebOCI pkgsLinuxAmd64 nodejsLinuxAmd64;
          "devguard-web-arm64" = mkDevguardWebOCI pkgsLinuxArm64 nodejsLinuxArm64;
        };
      }
    );
}