// Source - https://stackoverflow.com/questions/61015445/using-web-components-within-preact-and-typescript
import "preact";

declare module "preact" {
  namespace JSX {
    interface IntrinsicElements {
      "ot-tabs": HTMLAttributes<HTMLElement>;
    }
  }
}
