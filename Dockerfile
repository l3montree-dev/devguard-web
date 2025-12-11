# Copyright (C) 2024 Tim Bastin, l3montree GmbH
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
# 
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

FROM node:24.11.1@sha256:d5a23e0d0ee9d6ebb2f37aef0aaad77c5e1286b45475c5b6aa3216abaad98084 as build-env
LABEL maintainer="L3montree & DevGuard contributors"

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1
ARG VERSION
ARG DEVGUARD_API_URL
ARG SENTRY_AUTH_TOKEN

WORKDIR /usr/app/

ENV PORT 3000
EXPOSE 3000

ENV NEXT_PUBLIC_ENVIRONMENT production
ENV NEXT_PUBLIC_VERSION $VERSION
ENV SENTRY_AUTH_TOKEN $SENTRY_AUTH_TOKEN

COPY package-lock.json .
COPY package.json .

RUN npm ci

COPY . .

ENV NEXT_SHARP_PATH=/usr/app/node_modules/sharp

# Build
RUN npm run build

RUN mkdir -p /usr/app/.next/cache/images && chown -R 53111:53111 /usr/app/.next/cache/images

# Second stage
# Use distroless image for production
FROM registry.opencode.de/open-code/oci/nodejs:24-minimal@sha256:241757b4b5a2197f04e7aac0480a59f4e8ee3d428ae11e4c57410917a2b01eef

USER 53111

WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
ENV NEXT_TELEMETRY_DISABLED 1

# Copy from build
COPY --from=build-env --chown=53111:53111 /usr/app/next.config.js ./
COPY --from=build-env --chown=53111:53111 /usr/app/public ./public
COPY --from=build-env /usr/app/.next ./.next
COPY --from=build-env /usr/app/node_modules ./node_modules

# Run app command
CMD ["./node_modules/next/dist/bin/next", "start"]