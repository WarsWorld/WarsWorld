## generate-spreadsheets

This is a node.js script using sharp.js as a dependency, originally written by FunctionDJ.

This utility creates spritesheets with images sourced from [AWBW-Replay-Player](https://github.com/DeamonHunter/AWBW-Replay-Player/) by DeamonHunter (MIT License).
It requires you to setup an input and output directory (see below).

### Running `main.ts`

You can run the script using the following command:

```sh
node --loader ts-node/esm main.ts -t [path/to/textures] -o [path/to/output]
```

The optional parameters are as follow:

- `--texturesBasePath, -t`: (Optional) Path to the `Textures` directory. Default is `AWBW-Replay-Player/AWBWApp.Resources/Textures`. You can resolve this by cloning the [AWBW-Replay-Player](https://github.com/DeamonHunter/AWBW-Replay-Player/) repository to be cloned into the same directory as the script:

  ```
  # cd [PROJECT_ROOT]/utils/generate-spritesheets
  git clone https://github.com/DeamonHunter/AWBW-Replay-Player/
  ```

- `--outputPath, -o`: (Optional) Path to the `output` directory. Default is `output`. This directory must exist:

  ```
  mkdir output
  ```
