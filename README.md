# TabFlip

TabFlip is a lightweight Chrome extension for moving through recently used tabs with **Alt+Q**. It brings fast, keyboard-first tab switching to Chrome without adding a framework or runtime dependency.

## Features

- Switches directly to the next tab in recent-use order.
- Reverses direction at each end of the recorded history instead of wrapping to unrelated tabs.
- Works across Chrome windows.
- Uses the supplied black-and-white swirl logo in a rounded-square icon.
- Keeps history for the current Chrome session, including while you switch to another app.
- Removes closed tabs and does not add every open tab to the cycle.

For example, if the recorded visit order is `1 → 3 → 4 → 2`, cycling from `1` continues `3 → 4 → 2 → 4 → 3 → 1`.

## Technologies

- Chrome Extensions Manifest V3
- JavaScript ES modules
- Chrome Tabs, Commands, and Storage APIs
- Node.js built-in test runner for unit tests

There are no runtime or development package dependencies.

## Download

[Download the latest source ZIP from the `main` branch](https://github.com/karthiGit03/tabflip/archive/refs/heads/main.zip). After extracting it, open the `tabflip-main` folder; it contains the extension files.

This link downloads the current source snapshot and works without a GitHub Release. For versioned downloads, publish a GitHub Release and attach a ZIP file under its **Assets** section.

## Installation

1. Download and extract the ZIP file.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the extracted `tabflip-main` folder containing `manifest.json`.

## First run and use

1. Check that **Alt+Q** is assigned at `chrome://extensions/shortcuts`.
2. Switch through the tabs you want TabFlip to remember.
3. Press **Alt+Q** to cycle through them. It reverses direction at either end.

TabFlip remembers activated tabs for the current Chrome session. It works across Chrome windows and skips tabs you have not visited.

## Project structure

```text
TabFlip/
├── manifest.json          # Chrome extension configuration
├── assets/
│   └── icons/              # Toolbar and extension icons
│       ├── icon16.png
│       ├── icon32.png
│       ├── icon48.png
│       └── icon128.png
├── package.json           # Dependency-free test and syntax-check scripts
├── src/
│   ├── background.js      # Chrome event handlers and tab switching
│   └── history.js         # Pure recent-history and cycling logic
├── tests/
│   ├── history.test.js    # Recent order, reverse cycling, and pruning tests
│   └── manifest.test.js   # Manifest and service worker checks
├── CONTRIBUTING.md        # Contribution workflow
├── LICENSE                # Project license
└── README.md
```

## Run checks

Install Node.js, then run:

```sh
npm test
npm run check
```

The automated checks cover the history rules and manifest wiring. Changes to Chrome API behavior should also be tried in Chrome by reloading the unpacked extension and switching through several tabs and windows.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the project guidelines and development steps.

## License

See [LICENSE](LICENSE).







