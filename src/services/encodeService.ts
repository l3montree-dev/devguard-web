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

export const encodeObjectBase64 = (input: Record<string, string>) => {
  // first, we convert the input to a string
  const inputString = JSON.stringify(input);
  return Buffer.from(inputString).toString("base64");
};

export const encodeStringBase64 = (input: string) => {
  return Buffer.from(input).toString("base64");
};

export const decodeStringBase64 = (input: string) => {
  return Buffer.from(input, "base64").toString("utf-8");
};

export const decodeObjectBase64 = (input: string) => {
  const decodedString = Buffer.from(input, "base64").toString("utf-8");
  return JSON.parse(decodedString);
};
