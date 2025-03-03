# My TODO List
- [x] ~~Setup an EditorConfig~~
- [ ] Move rust code into src directory
  - [ ] Check if this means Chrome (or other browsers) can debug the WASM now
- [ ] Form for setting up render configuration
  - [ ] Pass these settings into the renderer (via worker message)
- [ ] Update Jenkins build (and agents) to be able to build rust code to WASM
- [ ] Look into using python build scripts instead of VS Code tasks

### Some fine day:
- [ ] Bundle with Rollup (or switch to Vite)
- [ ] Bundle CSS
- [ ] Add Babel for polyfills
- [ ] ESLint / Biome / Whatever is the current preference for code quality
- [ ] Git commit hook to check any new/renamed files match a gitattributes rule
- [ ] Host on intranet
