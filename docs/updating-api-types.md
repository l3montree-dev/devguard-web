# Updating API types

`src/types/api/generated.ts` is generated from the devguard backend's
`docs/swagger.json`. In DevGuard Backend - never edit it by hand.

## Regenerate

From the devguard repo, after changing a controller annotation:

```sh
make docs
```

Then from devguard-web:

```sh
# against a local devguard checkout
make api-client SWAGGER_FILE=../devguard/docs/swagger.json

# or against a branch on GitHub (defaults to main)
make api-client
make api-client DEVGUARD_REF=my-branch
```

CI runs `make api-client-check`, which fails if the committed file is stale.

## Then fix the fallout

```sh
npx tsc --noEmit
npm run lint
npm run knip
```

`tsc` errors show where the frontend disagreed with the API.

## Where types live

| Location                     | Contents                                                  |
| ---------------------------- | --------------------------------------------------------- |
| `src/types/api/generated.ts` | generated, never edited                                   |
| `src/types/dto.ts`           | one-line aliases onto generated schemas                   |
| `src/types/view/*.ts`        | frontend-only types, and compositions over generated ones |

Prefer an alias in `dto.ts`:

Compose in `src/types/view/` only when the spec genuinely cannot express the
shape, and say why in a comment.
