## Structure

Monorepo with npm workspaces:

- `apps/marketing` — Astro marketing site (active)
- `apps/app` — future React + Tailwind SPA (placeholder)
- `apps/api` — future backend API (placeholder)
- `packages/ui` — shared React components (islands) for both apps
- `packages/config` — shared content/data
- `packages/tokens` — shared design tokens / Tailwind preset

## Development

Install from the root: `npm install`

Run the marketing dev server from the root:

```
npm run dev
```

Or from the marketing workspace directly:

```
npm run dev --workspace @kaundinya/marketing
```

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
