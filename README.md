# Brush 🖌️

An experiment in replacing the SaatchiArt Easel API.

Some different things I used:

- [Node 19.4.0](https://nodejs.org/en/blog/release/v19.4.0/)
- [Express 4.8.2](https://expressjs.com/)
- [Typescript](https://www.typescriptlang.org/)
- [pnpm](https://pnpm.io/)
- [Zod](https://zod.dev/) for API response validation instead of whitelisting
- Use controller modules instead of just routes with closures
- Use custom exceptions instead of returning `{ success: boolean }` with everything
- Tests with [vitest](https://vitest.dev/)

TODO:

- try [NestJS](https://nestjs.com/)
