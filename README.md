# HaxBot
Server script for HaxBall game.

The project uses [google/closure-compiler](https://github.com/google/closure-compiler) for compiling output script.

## Configuration

Create your own `configuration.js` file in `src` folder. You can use `src/configuration.js.dist` as a reference.

## Commands

### Download server stub

Generates server stub from [HaxBall headless server documentation](https://github.com/haxball/haxball-issues/wiki/Headless-Host).

```shell script
composer code:download
```

### Compile project

Merges all project's files into one with given [optimization setting](https://github.com/google/closure-compiler/wiki/Flags-and-Options).

```shell script
composer code:compile  # Only merges project files
composer code:minify  # Merges project files and optimizes them  with standard settings
composer code:minify-advanced  # Merges project files and optimizes them  with advanced settings
```
