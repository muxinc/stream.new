/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render () {
    return (
      <Html lang="en">
        <Head>
          <style>
            @import url(https://static.mux.com/fonts/fonts.css);
          </style>
          <link rel="preload" href="https://static.mux.com/fonts/fonts.css" as="font" />
          <script src="https://src.litix.io/core/3/mux.js" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
export default MyDocument;
