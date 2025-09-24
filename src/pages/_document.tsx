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

import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";

import { inter, lexend, merriweather } from "@/pages/_app";

class MyDocument extends Document {
  render() {
    return (
      <Html
        className={
          "h-full scroll-smooth antialiased " +
          lexend.className +
          " " +
          inter.className
        }
        lang="en"
      >
        <Head />
        <body
          className={
            "flex min-h-full flex-col " +
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
}

export default MyDocument;
MyDocument.getInitialProps = async (
  ctx: DocumentContext,
): Promise<DocumentInitialProps> => {
  const initialProps = await Document.getInitialProps(ctx);
  if (process.env.THEME_JS_URL) {
    console.log("Using THEME_JS_URL from env:", process.env.THEME_JS_URL);
  }
  if (process.env.THEME_CSS_URL) {
    console.log("Using THEME_CSS_URL from env:", process.env.THEME_CSS_URL);
  }

  return {
    ...initialProps,
    styles: (
      <>
        {initialProps.styles}
        {process.env.THEME_CSS_URL && (
          <link rel="stylesheet" href={process.env.THEME_CSS_URL} />
        )}
        {process.env.THEME_JS_URL && (
          <script async defer src={process.env.THEME_JS_URL} />
        )}
      </>
    ),
  };
};
