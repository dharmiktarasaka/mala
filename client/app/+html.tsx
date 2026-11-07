import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Custom Root HTML wrapper for Expo Router Web Export.
 * Strips all default browser focus outlines and borders across all inputs, buttons, and elements.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>MALA - Sacred Sadhana & Devotee Community</title>
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Global outline reset: eliminate black browser focus borders on all inputs, textareas & buttons */
              *,
              *:focus,
              *:focus-visible,
              *:active,
              input,
              input:focus,
              input:focus-visible,
              textarea,
              textarea:focus,
              textarea:focus-visible,
              select,
              select:focus,
              select:focus-visible,
              [contenteditable="true"],
              [contenteditable="true"]:focus,
              [tabindex]:focus {
                outline: none !important;
                outline-style: none !important;
                outline-width: 0 !important;
                outline-color: transparent !important;
                box-shadow: none !important;
                -webkit-tap-highlight-color: transparent !important;
              }

              /* Smooth layout adjustments */
              html, body {
                height: 100%;
                background-color: #FAF7F2;
              }
              #root {
                display: flex;
                height: 100%;
                flex: 1;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

