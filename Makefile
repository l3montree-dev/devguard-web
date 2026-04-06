NIX_CACHE_BUCKET     ?= nix.garage.l3montree.cloud
NIX_CACHE_ENDPOINT   ?= s3.garage.l3montree.cloud
NIX_CACHE_REGION     ?= garage
NIX_CACHE_SECRET_KEY ?= /etc/nix/cache-priv-key.pem

nix-cache-push::
	@echo "Building node_modules..."
	nix build --no-link .#node_modules
	@echo "Pushing closure to S3 cache..."
	nix copy \
		$$(nix path-info -r .#node_modules) \
		--to 's3://$(NIX_CACHE_BUCKET)?endpoint=$(NIX_CACHE_ENDPOINT)&region=$(NIX_CACHE_REGION)&scheme=https&profile=garage&secret-key=$(NIX_CACHE_SECRET_KEY)'