// Copyright (C) 2024 Tim Bastin, l3montree GmbH
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
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

export class HttpError extends Error {
  statusCode?: number;
  title?: string;
  description?: string;
  homeLink?: string;

  constructor(
    message = "HTTP Error",
    options?: {
      statusCode?: number;
      title?: string;
      description?: string;
      homeLink?: string;
    },
  ) {
    // Encode error context in the message so it survives serialization to client
    const contextData = {
      statusCode: options?.statusCode,
      title: options?.title,
      description: options?.description,
      homeLink: options?.homeLink,
    };
    super(JSON.stringify({ message, context: contextData }));
    this.statusCode = options?.statusCode;
    this.title = options?.title;
    this.description = options?.description;
    this.homeLink = options?.homeLink;
  }
}
