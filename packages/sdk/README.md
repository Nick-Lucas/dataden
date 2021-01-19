# DataDen SDK

This SDK provides a lot of utilities to help build your plugins:

| Name                                 | Built?      |
| ------------------------------------ | ----------- |
| Plugin Creation Helpers              | ✅ Built     |
| Typescript interfaces & docs         | ✅ Built     |
| 'dataden-scripts' CLI                | ✅ Built     |
| Integrated build tools               | ✅ Built     |
| Emulator with DataDen feature parity | ✅ Built     |
| Integrated linting tools             | 🟠 Coming... |
| Integrated test tools                | 🟠 Coming... |

## Creating a Plugin

Check out our [1st party plugins](https://github.com/Nick-Lucas/dataden-plugins) for complete examples of using the SDK, but in short a few things are required:

* Your entry file exports `createPlugin(...)` as default
* Your package.json defines a `main` field pointing at your entry file
* Your plugin is published on NPM if you want to contribute it to our plugin registry for others to use
* **Important:** It is _highly_ recommended that you use the package.json `files` property to whitelist your `dist/` directory and nothing else for publishing. Don't accidentally publish your `.authcache.json` or `outputs/` from the emulator and leak personal data

```js
// index.ts

import { createPlugin } from '@dataden/sdk'

export default createPlugin({
  // ... implement some plugin APIs ...
})

```

While Typescript should be preferred, both `.ts` and `.js` files are also supported, so you can use plain javascript if you prefer. Types are great though!
