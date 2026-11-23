# Contributing to TabFlip

Thanks for considering a contribution.

## Before you start

- Keep TabFlip lightweight and dependency-free.
- Open an issue before making a large feature change.
- Keep changes focused and explain user-visible behavior in the README.

## Development

1. Install a current Node.js release. No npm packages are required.
2. Make your changes in the relevant `src/` files.
3. Run `npm test` and `npm run check`.
4. Load the project folder as an unpacked extension in Chrome to verify browser behavior.
5. Open a pull request with a clear summary and testing notes.

## Tests

Pure tab-history behavior is covered by Node's built-in test runner. Chrome API behavior should also be checked in Chrome when a change affects the extension service worker or manifest.
