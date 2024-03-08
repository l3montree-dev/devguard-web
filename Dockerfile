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

FROM node:20.11.1 as build-env
LABEL maintainer="Sebastian Kawelke <sebatian.kawelke@neuland-homeland.de"

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

WORKDIR /usr/app/

ENV PORT 3000
EXPOSE 3000

ENV NEXT_PUBLIC_ENVIRONMENT production
ENV NODE_ENV production

COPY package*.json .

RUN npm install

COPY . .

# Build
RUN npm run build

# Running the app
FROM gcr.io/distroless/nodejs20-debian12 AS runner
WORKDIR /app

# Mark as prod, disable telemetry, set port
ENV NODE_ENV production
ENV PORT 3000
ENV NEXT_TELEMETRY_DISABLED 1

# Copy from build
COPY --from=build-env /app/next.config.js ./
COPY --from=build-env /app/public ./public
COPY --from=build-env /app/.next ./.next
COPY --from=build-env /app/node_modules ./node_modules

# Run app command
CMD ["./node_modules/next/dist/bin/next", "start"]