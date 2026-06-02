import { html } from "htm/preact";
import type { ComponentChildren } from "preact";
import stylesUrl from "../assets/styles.css" with { type: "file" };

interface LayoutProps {
  title: string;
  children: ComponentChildren;
}

export default function Layout({ title, children }: LayoutProps) {
  return html`
    <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="${stylesUrl}" />
      </head>
      <body>
        <div class="container">
          <header>
            <h1>Répartipotes</h1>
            <p class="subtitle">
              Split expenses with friends, simply and fairly.
            </p>
          </header>
          <main>
            ${children}
          </main>
          <footer>
            <p><strong>Répartipotes</strong> — split expenses with friends</p>
          </footer>
        </div>
      </body>
    </html>
  `;
}
