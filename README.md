
## Install

Install dependencies first

```bash
yarn -i
# or
npm i
```

## Dev mode

Due to `yarn` accepts it's own arguments in cli, use env variable `ARGV` to pass them.

```bash
ARGV="-h" yarn dev

ARGV="help upload" yarn dev

ARGV="u -s ./path/to/your\ sources -a xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" yarn dev
```

## Pack

```bash
# for your curent OS
yarn package

# for all
yarn package-all
```

When package for all systems better run on MacOS. Due to macOS Code Signing works only on macOS
https://www.electron.build/multi-platform-build
