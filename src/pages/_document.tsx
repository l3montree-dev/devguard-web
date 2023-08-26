// Copyright (C) 2023 Tim Bastin, Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
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

import { Head, Html, Main, NextScript } from "next/document";

import { lexend, inter, merriweather } from "@/pages/_app";
const env = process.env.NODE_ENV;
export default function Document() {
  return (
    <Html
      className={
        "h-full scroll-smooth bg-white antialiased " +
        lexend.className +
        " " +
        inter.className
      }
      lang="de"
    >
      <Head />
      <body
        className={
          "flex min-h-full flex-col bg-slate-950 " +
          inter.variable +
          " " +
          lexend.variable +
          " " +
          merriweather.variable
        }
      >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
