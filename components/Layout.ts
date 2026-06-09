import { html } from "htm/preact";
import type { ComponentChildren } from "preact";

interface LayoutProps {
  title: string;
  children: ComponentChildren;
  styles?: string[];
}

export default function Layout({ title, children, styles }: LayoutProps) {
  return html`
    <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/@knadh/oat/oat.min.css"
        />
        <script src="https://unpkg.com/@knadh/oat/oat.min.js" defer></script>
        ${(styles ?? []).map(
          (s) => html`<link rel="stylesheet" href="${s}" />`,
        )}
      </head>
      <body>
        <div class="container">
          <header>
            <h1>
              <a href="/" style="color:inherit;text-decoration:none"
                >Répartipotes</a
              >
            </h1>
            <p>
              Split expenses with friends, simply and fairly.
            </p>
          </header>
          <main>${children}</main>
          <footer>
            <p><strong>Répartipotes</strong> — split expenses with friends</p>
          </footer>
        </div>
      </body>
    </html>
  `;
}
