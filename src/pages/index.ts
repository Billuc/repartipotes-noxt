/**
 * Home page - list all splits
 * Shows create split button and loads active splits
 */

import { html } from "htm/preact";
import { asIsland } from "@lib/server";
import Layout from "../components/Layout";
import CreateSplitForm from "../components/CreateSplitForm";

const CreateSplitFormIsland = await asIsland(CreateSplitForm);

export default function HomePage() {
  return html`
    <${Layout} title="Home">
      <div class="container">
        <header class="page-header">
          <h1>Split the Bob</h1>
          <p class="subtitle">Manage expenses with friends easily</p>
        </header>

        <section class="page-content">
          <div class="actions-bar">
            <${CreateSplitFormIsland} />
          </div>

          <div id="splits-loader" class="splits-loader">
            <p>Loading your splits...</p>
          </div>

          <script>
            // Load splits on page load
            async function loadSplits() {
              try {
                const response = await fetch("/api/getSplits");
                const html = await response.text();
                const loader = document.getElementById("splits-loader");
                if (loader) {
                  loader.innerHTML = html;
                }
              } catch (error) {
                console.error("Error loading splits:", error);
                const loader = document.getElementById("splits-loader");
                if (loader) {
                  loader.innerHTML = '<div class="error">Failed to load splits</div>';
                }
              }
            }
            
            if (document.readyState === "loading") {
              document.addEventListener("DOMContentLoaded", loadSplits);
            } else {
              loadSplits();
            }
          </script>
        </section>
      </div>
    </>
  `;
}
