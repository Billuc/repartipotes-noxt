/**
 * Base layout component for all pages
 * Wraps content with HTML boilerplate, head, and body tags
 */

import { html } from "htm/preact";
import type { ComponentChildren } from "preact";

interface LayoutProps {
  title: string;
  children: ComponentChildren;
}

export default function Layout({ title, children }: LayoutProps) {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title} - Split the Bob</title>
        <link rel="stylesheet" href="/assets/styles.css" />
      </head>
      <body>
        ${children}
      </body>
    </html>
  `;
}
