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

FROM node:24.13.0@sha256:1de022d8459f896fff2e7b865823699dc7a8d5567507e8b87b14a7442e07f206 as build-env
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
COPY patches/ ./patches/

RUN npm ci

COPY . .

ENV NEXT_SHARP_PATH=/usr/app/node_modules/sharp

# Build
RUN npm run build

RUN mkdir -p /usr/app/.next/cache/images && chown -R 53111:53111 /usr/app/.next/cache/images

# Second stage
# Use distroless image for production
FROM registry.opencode.de/open-code/oci/nodejs:24-minimal@sha256:fa2e475214d03e1bf2027aa01fa094cf0648da360318e94268aa64c591a9910b

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