# Contributing to NirdJs

Thank you for your interest in contributing to NirdJs! We welcome contributions of all kinds, including bug reports, feature requests, code contributions, and documentation improvements.

### Links

GitHub: https://github.com/nirdjs/nirdjs
NPM: https://www.npmjs.com/package/nirdjs
Deno JSR: https://jsr.io/@nirdjs/nirdjs
Create pull request: https://github.com/nirdjs/nirdjs/pulls

# PREREQUISITES

## Bun

Installation guide: https://bun.sh/docs/installation

Why bun? 

- no extra configuration
- typescript unit test support
- TSX support, including test

## Node

Installation guide: https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/

Why node?

- Bun uses Node under the hood sometimes

## Deno, optional

Why deno?

- Deno is used for testing.
- Deno package is published using GitHub Actions.

# GETTING STARTED

Install dependencies

```sh
bun install
bun test
```
# CONTRIBUTING

## Write unit tests

Test code is based on Bun's jest-inspired API.
```
https://bun.sh/docs/cli/test
```


# BUILDING

NirdJs is using `npx tsup` for building types and creating different module system files.

```sh
bun run build
```

https://github.com/egoist/tsup

NOTE: `bun tsup ...` does not work.

# DEPLOYING

Update `package.json` version.

```sh
npm publish
```

NOTE: Deno package will deploy automatically via Github Actions.



