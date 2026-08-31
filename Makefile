DEVGUARD_REF        ?= main
SWAGGER_URL         ?= https://raw.githubusercontent.com/l3montree-dev/devguard/$(DEVGUARD_REF)/docs/swagger.json
API_CLIENT_OUT      ?= src/types/api/generated.ts
OPENAPI_TYPESCRIPT  ?= openapi-typescript@7.13.0

api-client::
ifdef SWAGGER_FILE
	@echo "Using local spec $(SWAGGER_FILE)..."
	@cp '$(SWAGGER_FILE)' /tmp/devguard-swagger.json
else
	@echo "Fetching swagger.json from devguard@$(DEVGUARD_REF)..."
	@curl -sSfL '$(SWAGGER_URL)' -o /tmp/devguard-swagger.json
endif
	@npx -y $(OPENAPI_TYPESCRIPT) /tmp/devguard-swagger.json -o $(API_CLIENT_OUT)
	@npx prettier --log-level warn --write $(API_CLIENT_OUT)
	@echo "Wrote $(API_CLIENT_OUT)"

api-client-check:: api-client
	@test -z "$$(git status --porcelain -- $(API_CLIENT_OUT))" \
		|| { echo "::error::$(API_CLIENT_OUT) is stale - run 'make api-client' and commit the result."; git --no-pager diff -- $(API_CLIENT_OUT); exit 1; }

NIX_CACHE_BUCKET     ?= nix.garage.l3montree.cloud
NIX_CACHE_ENDPOINT   ?= s3.garage.l3montree.cloud
NIX_CACHE_REGION     ?= garage
NIX_CACHE_SECRET_KEY ?= /etc/nix/cache-priv-key.pem

nix-cache-push::
	@echo "Building node_modules..."
	nix build --no-link .#node_modulesAmd64 .#node_modulesArm64
	@echo "Pushing arm64 closure to S3 cache..."
	nix copy .#node_modulesArm64 \
		--to 's3://$(NIX_CACHE_BUCKET)?endpoint=$(NIX_CACHE_ENDPOINT)&region=$(NIX_CACHE_REGION)&scheme=https&profile=garage&secret-key=$(NIX_CACHE_SECRET_KEY)&multipart-upload=true'

	@echo "Pushing amd64 closure to S3 cache..."
	nix copy .#node_modulesAmd64 \
		--to 's3://$(NIX_CACHE_BUCKET)?endpoint=$(NIX_CACHE_ENDPOINT)&region=$(NIX_CACHE_REGION)&scheme=https&profile=garage&secret-key=$(NIX_CACHE_SECRET_KEY)&multipart-upload=true'