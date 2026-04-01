# Dynamic JavaScript SDK — React reference app

Reference implementation for integrating the [Dynamic](https://www.dynamic.xyz/) JavaScript SDK (`@dynamic-labs-sdk/*`) in a React app: authentication, multi-chain wallets, WalletConnect, and related UI patterns.

## Requirements

- Node.js **18.18+**
- A Dynamic project and **Environment ID** from the [Dynamic dashboard](https://app.dynamic.xyz/)

## Quick start

```bash
npm install
cp .env.example .env
```

Edit `.env` and set `VITE_DYNAMIC_ENVIRONMENT_ID` to your Environment ID.

```bash
npm run dev
```

The dev server listens on [http://localhost:5200](http://localhost:5200).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_DYNAMIC_ENVIRONMENT_ID` | Yes | Your Dynamic Environment ID |

See `.env.example` for copy-paste templates.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Documentation

- [Dynamic docs](https://docs.dynamic.xyz/)
- JavaScript SDK packages are published under the `@dynamic-labs-sdk` scope on npm.

## License

MIT — see [LICENSE](./LICENSE).
