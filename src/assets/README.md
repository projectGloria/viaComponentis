# Custom Character Assets (`src/assets/`)

`<CharacterRig />` automatically discovers transparent character PNGs placed in this folder:

1. **Split Two-Layer Mode (independent 60fps head tracking):**
   - `character-head.png`
   - `character-body.png`

2. **Single-Layer Mode (gentle 2.5D cursor tilt):**
   - `character.png`

3. **Default Fallback:**
   - If no PNGs are provided, `<CharacterRig />` renders the built-in monochrome two-layer cyber-avatar SVG.
