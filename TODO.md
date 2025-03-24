# My TODO List
- [x] Setup an EditorConfig
- [ ] ~~Move rust code into src directory~~
  - [x] Check if this means Chrome (or other browsers) can debug the WASM now
  - Can debug with the [Chrome DevTools DWARF debugging support](https://chromewebstore.google.com/detail/pdcpmagijalfljmkmjngeonclgbbannb) and the WebAssembly DWARF Debugging VS Code extension
- [ ] Form for setting up render configuration
  - [ ] Pass these settings into the renderer (via worker message)
- [ ] Update Jenkins build (and agents) to be able to build rust code to WASM
- [ ] Look into using python build scripts instead of VS Code tasks

### Some fine day:
- [x] Bundle with Rollup ~~(or switch to Vite)~~
- [ ] Bundle CSS
- [ ] Add Babel for polyfills
- [ ] ESLint / Biome / Whatever is the current preference for code quality
- [ ] Git commit hook to check any new/renamed files match a gitattributes rule
- [ ] Host on intranet
