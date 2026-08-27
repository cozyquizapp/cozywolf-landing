# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Deployen

**Auf `master` pushen und den Arbeitszweig danach mehrere Minuten in Ruhe
lassen.** Nicht beides direkt hintereinander.

```
git push origin <zweig>:master
# ... warten, Deployment abwarten ...
git push -u origin <zweig>
```

Belegt am 27.08.2026 an sieben Pushes. Vercel legt fuer einen Commit, der
innerhalb weniger Sekunden auf zwei Zweigen landet, oft gar kein Deployment
an, auch keines mit Status Error oder Canceled: bei Statusfilter 7/7 fehlten
`5ed067e`, `61f2bb4`, `5adf6b4`, `f20eb02`, `7219dcb` und `1d184be`
vollstaendig. Der einzige Push, der sauber als Production auf `master`
durchlief, war `e2df3e8`, und das war der einzige, der allein auf `master`
ging.

Eine frueher hier stehende Erklaerung, es liege an der Reihenfolge
(erst Zweig, dann `master`), war falsch: `f20eb02` ging zuerst auf `master`
und kam trotzdem nicht an. Es liegt an der Naehe der beiden Pushes, nicht an
ihrer Reihenfolge.

Wenn ein Stand trotzdem nicht ankommt, hilft in Vercel bei einem fertigen
Deployment "Promote to Production". Dauerhaft repariert wird es, indem man
unter Settings, Git das Repository trennt und neu verbindet, damit der
Webhook bei GitHub neu gesetzt wird.

Wer den ausgelieferten Stand pruefen will: `cozywolf.de/stand.txt` nennt
Commit, Zweig und Bauzeitpunkt.
