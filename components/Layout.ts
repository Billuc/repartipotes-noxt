import { html } from "htm/preact";
import type { ComponentChildren } from "preact";
import customStyles from "../assets/styles.css" with { type: "file" };

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/@knadh/oat/oat.min.css"
        />
        <script src="https://unpkg.com/@knadh/oat/oat.min.js" defer></script>
        <link rel="stylesheet" href=${customStyles} />
        ${(styles ?? []).map(
          (s) => html`<link rel="stylesheet" href="${s}" />`,
        )}
      </head>
      <body>
        <div class="container">
          <header>
            <h1>
              <a href="/" class="unstyled" style="color:inherit"
                >Répartipotes</a
              >
            </h1>
            <p class="text-light">
              Split expenses with friends, simply and fairly.
            </p>
          </header>
          <main>${children}</main>
          <footer>
            <p class="text-light">
              <strong>Répartipotes</strong> — split expenses with friends
            </p>
          </footer>
        </div>
      </body>
    </html>
  `;
}
