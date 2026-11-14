# Creator Studio v0.5.5

License: [Personal writing license](LICENSE.txt) · [Third-party notices](THIRD_PARTY_NOTICES.txt)


[Read in Simplified Chinese](README.zh-CN.md)

A local fiction writing desk for people who want to explore and shape their own stories. Write directly, ask a model to continue, edit the result, and use undo or redo to try another direction.

## Download for everyday use

| Your computer | Download | How to start |
| --- | --- | --- |
| Windows x64 | [Windows portable ZIP](https://github.com/kssh0040848-maker/Creator-AI-Novel-Editor-/releases/download/v0.5.5/Creator-Studio-v0.5.5-Windows-x64.zip) | Extract the ZIP, then double-click `start-windows.bat`. Node.js is included. |
| macOS (Apple Silicon or Intel) | [Mac portable ZIP](https://github.com/kssh0040848-maker/Creator-AI-Novel-Editor-/releases/download/v0.5.5/Creator-Studio-v0.5.5-macOS.zip) | Extract the ZIP, then double-click `start-mac.command`. If Node.js is missing, the first run downloads and verifies it. |

These are [v0.5.5 preview builds](https://github.com/kssh0040848-maker/Creator-AI-Novel-Editor-/releases/tag/v0.5.5). Keep the extracted folder intact. The Mac launcher needs an internet connection on first use when it downloads Node.js. The **Code → Download ZIP** button above downloads source code, not the Windows portable package.

**This repository contains source code, not the bundled Windows runtime.** To run it from a clone or GitHub source ZIP, install Node.js 22+ and run `npm start` in the project directory. The portable Windows and Mac packages use the launchers described below.

## Start

### Windows portable download

1. Extract the **entire Windows ZIP** to a folder.
2. Double-click `start-windows.bat`.
3. Your browser opens `http://127.0.0.1:4317/`.

The Windows package includes its Node.js runtime. No npm installation or administrator rights are needed. The launcher closes after starting the service in the background. Use **Stop local service** in the app or `stop-windows.bat` to stop it. If startup fails, use `start-windows-debug.bat` to see the error.

### macOS

Extract the Mac ZIP and double-click `start-mac.command`. The launcher uses an existing Node.js 22+ installation when available. Otherwise it downloads the pinned official runtime for Apple Silicon or Intel, verifies its checksum, and stores it inside this folder. The first run needs an internet connection. It does not install system-wide. Keep the terminal window open while using this Mac launcher.

If macOS reports a file permission problem, open Terminal in the extracted folder and run `sh start-mac.command`.

### From source / Linux

Install Node.js 22 or newer, then run:

```sh
npm start
```

The project has no third-party npm dependencies. Linux users can also run `sh start-mac-linux.sh`. The source ZIP does not include a runtime.

### Offline preview

Open `创作家-产品介绍.html` for the product introduction and embedded writing demo, or `打开原型.html` for the writing desk. These are self-contained previews. Use the local service for real API calls. Browser storage for file URLs can differ from storage at the local HTTP address; export a backup before switching.

## First visit and language

New local users see the introduction first, then enter the writing desk and its optional nine-step tour. Later launches open the desk directly. Existing saved stories bypass the first-visit introduction. This preference is local to the browser and address; clearing browser data resets it.

Use **English / 中文** at the top right of either page. The choice is remembered and updates the logo, menus, dialogs, introduction and tutorial. English is the default for non-Chinese browser languages. Switching the interface language never translates or rewrites existing story text, titles, memory, recaps or world notes.

## Main features

- **Guided start:** six questions for genre, character traits, goals, challenges, world and style. Review generated settings before creating a story.
- **Direct editing:** edit the current manuscript and continue from its latest ending. Streamed continuations support stopping, auto-scroll, undo and redo.
- **Story memory and author’s note:** keep facts, relationships, direction and style with each story.
- **World notes:** keyword-triggered entries for places, people and rules. Preview the context before sending it.
- **Chapters:** review or edit a recap before moving to the next chapter. Preserve earlier chapters and their history.
- **Context usage:** estimated input and output usage, with warnings and a choice to continue or recap. Estimates are not exact provider token counts.
- **Library:** search, rename, reorder and permanently delete after confirmation. Export text or back up all stories and settings.

## Connect a model

Use **Model connection**. Choose DeepSeek or a custom provider compatible with OpenAI Chat Completions. Enter the HTTPS base URL, model name and your API key locally. **Test connection** retrieves the model list. **Test generation** requests a short response using your API credit, without inserting it into the story. Then choose **Save and enable**.

Demo mode returns fixed text and makes no model calls. Live generation sends the selected story context to your provider, which may charge for usage. Custom compatibility does not include every API protocol; local HTTP model endpoints are not supported in this release.

On Windows, **Remember key on this computer** encrypts the last enabled key using the current Windows account. Keys are not included in story backups. Encrypted key storage is not available on macOS or Linux in this release; re-enter the key after closing the page.

## Upgrade and backup

Back up all stories in the old version, stop generation, then stop the old service and close its page. Extract the new package and launch using the same browser and `http://127.0.0.1:4317/`. Browser story storage and the local service identity are unchanged. Do not clear browser data as part of upgrading.

## Development

```sh
npm test
npm run build:prototype
```

- `web/`: application, introduction, bilingual UI and writing logic.
- `server.mjs`: local HTTP service and model proxy.
- `launcher.mjs`: Windows background service handoff.
- `credential-vault.mjs`: Windows encrypted key storage.
- `scripts/build-prototype.mjs`: reproducible standalone previews.
- `tests/`: dependency-free regression tests with simulated upstream model responses.

v0.5.5 passed 60 automated tests with simulated upstream responses. This release was checked in a Linux Node.js environment. Native Windows/macOS double-click validation and paid provider calls are still needed.

This is a local application. Public hosting requires a separate deployment and account/security design; do not expose this desktop local server directly to the internet.


v0.5.4 · Publisher attribution and release records:see [RELEASE-RECORD.md](RELEASE-RECORD.md). Runtime distribution and third-party terms remain as documented for v0.5.3.

## v0.5.5: provider choices

Model connection now offers DeepSeek, OpenAI, Claude, Gemini, Alibaba Cloud Model Studio (Qwen), xAI Grok, SiliconFlow, OpenRouter and Custom. Choosing a provider fills its compatible Chat Completions base URL; enter your own model ID and API key. Change the Qwen URL to match your region or workspace and use a key from that region. A listed provider is **not a claim that every model or account has passed a live test**. Enter the model ID and use Test generation to check it; this consumes API credit.

OpenAI requests use `max_completion_tokens` and omit sampling temperature for reasoning models. The Claude compatibility endpoint omits temperature. DeepSeek still disables thinking. This release handles text Chat Completions streams, not native Responses, Messages or local HTTP model endpoints.
