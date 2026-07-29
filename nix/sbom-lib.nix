# https://docs.devguard.org/explanations/supplementary-sboms/
{ pkgs }:

let
  pkg = builtins.fromJSON (builtins.readFile ../package.json);
  src = pkgs.lib.fileset.toSource {
    root = ../.;
    fileset = pkgs.lib.fileset.unions [ ../package.json ../package-lock.json ];
  };
in

pkgs.runCommand "devguard-web-sbom" {
  nativeBuildInputs = [ pkgs.trivy pkgs.jq ];
} ''
  mkdir -p $out/sboms

  export HOME="$TMPDIR"
  export TRIVY_CACHE_DIR="$TMPDIR/.trivy-cache"

  cp -r ${src} ./src
  chmod -R u+w ./src

  trivy fs --offline-scan --format cyclonedx --output raw.json ./src

  jq --arg name "${pkg.name}" --arg version "${pkg.version}" '
    ($name + "@" + $version) as $appVersioned
    | ("pkg:npm/" + $appVersioned) as $appPurl
    | .metadata.component."bom-ref" as $scanRoot
    | [.components[]? | select(.purl == null and .name == "package-lock.json") | ."bom-ref"] as $groups
    | (if ($groups | length) != 1
       then error("expected exactly one trivy npm grouping node, got \($groups | length)")
       else . end)
    | $groups[0] as $group
    | (.. | select(. == $group)) = $appPurl
    | .components = [.components[]? | select(."bom-ref" != $appPurl and ."bom-ref" != $scanRoot)]
    | .dependencies = [.dependencies[]? | select(.ref != $scanRoot)]
    | .metadata.component = {
        "type": "library",
        "bom-ref": $appPurl,
        "name": $name,
        "version": $version,
        "purl": $appPurl
      }
    | del(.serialNumber, .metadata.timestamp)
    | (([.components[]?."bom-ref"] + [$appPurl]) | unique) as $valid
    | .dependencies = [
        .dependencies[]?
        | select(.ref as $r | $valid | index($r))
        | .dependsOn = [(.dependsOn // [])[] | select(. as $d | $valid | index($d))]
      ]
  ' raw.json > $out/sboms/${pkg.name}.json
''
