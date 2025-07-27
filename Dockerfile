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

FROM node:24.4.1@sha256:601f205b7565b569d3b909a873cc9aa9c6f79b5052a9fe09d73e885760237c4c as build-env
LABEL maintainer="L3montree & DevGuard contributors"

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1
ARG VERSION
ARG DEVGUARD_API_URL
ARG NEXT_PUBLIC_ERROR_TRACKING_DSN
ARG SENTRY_AUTH_TOKEN

WORKDIR /usr/app/

ENV PORT 3000
EXPOSE 3000

ENV NEXT_PUBLIC_ENVIRONMENT production
ENV NEXT_PUBLIC_VERSION $VERSION
ENV NEXT_PUBLIC_DEVGUARD_API_URL $DEVGUARD_API_URL
ENV NEXT_PUBLIC_ERROR_TRACKING_DSN $NEXT_PUBLIC_ERROR_TRACKING_DSN
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
FROM gcr.io/distroless/nodejs24-debian12:nonroot@sha256:0b5e17788348e91a52ca63a6935e2ae6744b6018387e3f2c8bfe3f2fb04f9d51

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