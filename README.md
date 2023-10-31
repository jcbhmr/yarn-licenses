# `yarn licenses` standalone

🧶 `yarn licenses` from Yarn v1 as a standalone npm command for anyone

## Installation

```sh
npm install -D yarn-licenses
```

## Usage

```sh
yarn-licenses list
yarn-licenses generate-disclaimer
```

```jsonc
// package.json
{
  "scripts": {
    "prebuild": "yarn-licenses generate-disclaimer > NOTICE",
    "build": "vite build"
  }
}
```
