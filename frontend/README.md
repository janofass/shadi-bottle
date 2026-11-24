# React + Vite

## Backend API

Set `VITE_API_URL` in the frontend environment to the API base URL, including any API Gateway
stage, for example `https://jz230hukcg.execute-api.us-east-1.amazonaws.com/Prod`. The frontend
appends `/api/generate-sleeve`. If the variable is unset, it uses `http://localhost:8000`.
Restart the development server or rebuild after changing the value. Vite exposes `VITE_` values
to the browser, so do not put secrets in them.

The backend must allow the frontend's exact origin through CORS. The deployed API currently
allows `http://localhost:5173` and `http://127.0.0.1:5173`; other ports or hosted frontend
origins require a backend CORS update and deployment.

## Benchmark backgrounds

JPEG files in `src/assets/benchmarks/` are discovered by Vite and appear in the background style selector.
Use a unique filename stem as the style key (for example, `blue_garden.jpeg` becomes `blue_garden`);
new styles use a full-image crop and default color treatment. Radiant Stardust and Caligraphy Wrap
are excluded from the selector. Rebuild the frontend after adding assets for a production deployment.
Selecting a background restores its original image colors and sets the primary color picker to a
representative image color. Changing the primary color or choosing a palette preset tints the image;
selecting another background restores that image's original colors.
Style selection also chooses coordinating foil and text colors from the image. You can override
either color or apply a palette preset; selecting another style chooses new colors. The front uses
gold, silver, crimson red, cobalt blue, or noir black text, with gold as the default and an automatic
finish (gold or silver) or manual choice. Front text
is drawn directly over the artwork without background patches; the 3D preview uses reflective foil
and shallow relief on the front text, with stronger bevel and reflections on colored names. Busy artwork
may still reduce contrast between the letters.
Behind the bride and groom names and the date, the front has a translucent name banner (a photo,
banner, text sandwich). Choose its type (strip, card, oval or none), its color (up to three
dominant colors from the selected photo, plus white and black) and its opacity (default 50%).
Photos with stock-site watermarks (`circular_gradient`, `dots_in_spectrum`, `roses_are_forever`)
have a crop treatment in `BENCHMARK_TREATMENTS` that excludes the mark.
The crest
switches from a circle to a ribbon when the tagline needs more room.
The backend's design-brief generator has a separate benchmark image map; newly discovered frontend
styles send their key but do not automatically attach an image to that generator.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
