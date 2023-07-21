// Copyright 2023 Tim Bastin, l3montree UG (haftungsbeschränkt)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
          "flex h-full flex-col bg-gray-900 " +
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
