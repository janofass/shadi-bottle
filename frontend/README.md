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
new styles use a full-image crop and default color treatment. The original nine styles retain their
custom labels and crops. Rebuild the frontend after adding assets for a production deployment.
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
