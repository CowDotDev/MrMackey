---
id: qn027
name: NPM Script Overview
file_version: 1.0.2
app_version: 0.7.5-0
file_blobs:
  package.json: 6edf58588529ad060bffedc32f0fa990582b7b36
---

*   `test`[<sup id="fUmz1">↓</sup>](#f-fUmz1) Runs the Jest automation tests.
    
*   `lint`[<sup id="1aT151">↓</sup>](#f-1aT151) Checks our code against our defined eslint configuration - `📄 .eslintrc.js`
    
*   `prettier`[<sup id="Z1QR92R">↓</sup>](#f-Z1QR92R) Updates our codebase to match our code styling guidelines defined in `📄 .prettierrc.json`. Paths/files defined in `📄 .prettierignore` will be ignored.
    
*   `prepare`[<sup id="Z1a4lAK">↓</sup>](#f-Z1a4lAK) Installs husky automatically, utilizes npm native behavior where the `prepare`[<sup id="Z1a4lAK">↓</sup>](#f-Z1a4lAK) script will be ran on a local npm install: [https://docs.npmjs.com/cli/v8/using-npm/scripts#pre--post-scripts](https://docs.npmjs.com/cli/v8/using-npm/scripts#pre--post-scripts)
    
*   `check`[<sup id="2fcnia">↓</sup>](#f-2fcnia) Helper script that will run `lint`[<sup id="1aT151">↓</sup>](#f-1aT151) , `prepare`[<sup id="Z1a4lAK">↓</sup>](#f-Z1a4lAK) , and `test`[<sup id="fUmz1">↓</sup>](#f-fUmz1) together.
    
*   `start:local`[<sup id="Z1rDUwF">↓</sup>](#f-Z1rDUwF) Start the Discord bot locally
    
*   `start`[<sup id="Z2f7tzR">↓</sup>](#f-Z2f7tzR) Used to start the Discord bot on a background process. Once started all `console` messaging will be exported to `log.txt`[<sup id="BN190">↓</sup>](#f-BN190) , and the background process pid will be added to `pid.txt`[<sup id="2qMBFF">↓</sup>](#f-2qMBFF) so we have reference for stopping this process on command.
    
*   `stop`[<sup id="12gQrP">↓</sup>](#f-12gQrP) Uses the values saved to `pid.txt`[<sup id="2qMBFF">↓</sup>](#f-2qMBFF) to kill the background process the Discord bot is running on.
    
*   `deploy`[<sup id="sU6Xy">↓</sup>](#f-sU6Xy) Deploys our codebase to our GCP project.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 package.json
```json
⬜ 3        "version": "1.0.0",
⬜ 4        "description": "Discord Bot",
⬜ 5        "main": "index.js",
🟩 6        "scripts": {
🟩 7          "test": "jest",
🟩 8          "lint": "eslint --cache --fix",
🟩 9          "prettier": "prettier --write .",
🟩 10         "prepare": "npx husky install",
🟩 11         "check": "npm run lint && npm run prettier && npm run test",
🟩 12         "start:local": "ts-node -r tsconfig-paths/register index.ts",
🟩 13         "start": "nohup ts-node -r tsconfig-paths/register index.ts > log.txt 2>&1 & echo $! > pid.txt",
🟩 14         "stop": "kill $(tail pid.txt)",
🟩 15         "deploy": "gcloud app deploy"
🟩 16       },
⬜ 17       "repository": {
⬜ 18         "type": "git",
⬜ 19         "url": "git+https://github.com/CowDotDev/MrMackey.git"
```

<br/>

<!-- THIS IS AN AUTOGENERATED SECTION. DO NOT EDIT THIS SECTION DIRECTLY -->
### Swimm Note

<span id="f-2fcnia">check</span>[^](#2fcnia) - "package.json" L11
```json
    "check": "npm run lint && npm run prettier && npm run test",
```

<span id="f-sU6Xy">deploy</span>[^](#sU6Xy) - "package.json" L15
```json
    "deploy": "gcloud app deploy"
```

<span id="f-1aT151">lint</span>[^](#1aT151) - "package.json" L8
```json
    "lint": "eslint --cache --fix",
```

<span id="f-BN190">log.txt</span>[^](#BN190) - "package.json" L13
```json
    "start": "nohup ts-node -r tsconfig-paths/register index.ts > log.txt 2>&1 & echo $! > pid.txt",
```

<span id="f-2qMBFF">pid.txt</span>[^](#2qMBFF) - "package.json" L13
```json
    "start": "nohup ts-node -r tsconfig-paths/register index.ts > log.txt 2>&1 & echo $! > pid.txt",
```

<span id="f-Z1a4lAK">prepare</span>[^](#Z1a4lAK) - "package.json" L10
```json
    "prepare": "npx husky install",
```

<span id="f-Z1QR92R">prettier</span>[^](#Z1QR92R) - "package.json" L9
```json
    "prettier": "prettier --write .",
```

<span id="f-Z2f7tzR">start</span>[^](#Z2f7tzR) - "package.json" L12
```json
    "start:local": "ts-node -r tsconfig-paths/register index.ts",
```

<span id="f-Z1rDUwF">start:local</span>[^](#Z1rDUwF) - "package.json" L12
```json
    "start:local": "ts-node -r tsconfig-paths/register index.ts",
```

<span id="f-12gQrP">stop</span>[^](#12gQrP) - "package.json" L14
```json
    "stop": "kill $(tail pid.txt)",
```

<span id="f-fUmz1">test</span>[^](#fUmz1) - "package.json" L7
```json
    "test": "jest",
```

<br/>

This file was generated by Swimm. [Click here to view it in the app](https://app.swimm.io/repos/Z2l0aHViJTNBJTNBTXJNYWNrZXklM0ElM0FDb3dEb3REZXY=/docs/qn027).