# Copyright (C) 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
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

FROM node:22.14.0@sha256:c7fd844945a76eeaa83cb372e4d289b4a30b478a1c80e16c685b62c54156285b as build-env
LABEL maintainer="L3montree & DevGuard contributors"

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1
ARG VERSION
ARG DEVGUARD_API_URL

WORKDIR /usr/app/

ENV PORT 3000
EXPOSE 3000

ENV NEXT_PUBLIC_ENVIRONMENT production
ENV NEXT_PUBLIC_VERSION $VERSION
ENV NEXT_PUBLIC_DEVGUARD_API_URL $DEVGUARD_API_URL

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
FROM gcr.io/distroless/nodejs22-debian12:nonroot@sha256:578ac826dc647986c5b1cd4f6464842b15fc26becb16765b9f1fcc4d5e8294f7

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