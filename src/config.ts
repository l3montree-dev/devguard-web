// Copyright (C) 2023 Tim Bastin, l3montree GmbH
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
export const config = {
  devGuardApiUrl: process.env.DEVGUARD_API_URL,
  oryKratosUrl: process.env.ORY_KRATOS_URL,
  devguardApiUrlPublicInternet:
    process.env.DEVGUARD_API_URL_PUBLIC_INTERNET ||
    "https://api.main.devguard.org",
  devguardScannerTag: "main-latest",
  retryInterval: 3000,
};
