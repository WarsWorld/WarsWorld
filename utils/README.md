## WarsWorld utils

In this directory you will find miscellaneous standalone utilities.

### Installing requirements

Some utils have extra node dependencies documented in `package.json` under `"utilsDependencies"`. You can visualize them with

```sh
jq -r '.utilsDependencies' package.json
```

and you can install them automatically with

```sh
npm run install-utils
```

