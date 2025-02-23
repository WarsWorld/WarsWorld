## generate-spreadsheets

This is a node.js script using sharp.js as a dependency, originally written by FunctionDJ. 

This utility creates spritesheets with images sourced from [AWBW-Replay-Player](https://github.com/DeamonHunter/AWBW-Replay-Player/) by DeamonHunter (MIT License).

### Prerequisites

#### AWBW-Replay-Player/AWBWApp.Resources/Textures

This utility hardcodes some paths and in particular expects you to have the [AWBW-Replay-Player](https://github.com/DeamonHunter/AWBW-Replay-Player/) in the same directory as the script, and in particular the textures in `AWBW-Replay-Player/AWBWApp.Resources/Textures`.

To do this, you can run

```sh
# cd [PROJECT_ROOT]/utils/generate-spritesheets
git clone https://github.com/DeamonHunter/AWBW-Replay-Player/
```

#### output dir

You also need to set up an `output` dir:

```sh
mkdir output
```

### Running `main.ts`

Use something akin to

```sh
node --loader ts-node/esm main.ts
```

