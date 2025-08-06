# Terminal UI ASCII Icon Reference

This document lists all the Unicode emoji replacements with ASCII alternatives for better terminal compatibility.

## Menu Icons
- 🏭 Generate Component → `[+]`
- 📚 Browse Catalog → `[#]`
- 🤖 AI Assistant → `[*]`
- ⚙️ Settings → `[~]`
- 📊 Analytics → `[%]`
- 🚪 Exit → `[X]`

## Activity Log Icons
- 🚀 System/Launch → `>>>`
- 🌐 Network/Connected → `[o]`
- 📦 Package/Loading → `[#]` or `[P]`
- 🤖 AI Ready → `[*]`
- 💾 Cache/Save → `[S]`
- ✅ Success/Complete → `[OK]`
- 💡 Tip/Info → `[!]`
- 📈 Update/Progress → `[^]`
- 🔄 Sync/Refresh → `[~]`
- ⚡ Performance → `[>]`
- ❌ Error → `[X]`
- ⚠️ Warning → `[!]`
- 📝 Note/Default → `[i]`
- 🏗️ Building/Progress → `[>>]`
- 📁 File/Directory → `[F]`
- 🎨 Style/Art → `[A]`
- 📄 Document → `[D]`
- 👋 Goodbye → `[BYE]`
- 🔑 Key/Shortcuts → `[KEY]`

## Section Labels
- 🏠 Main Menu → `[HOME] Main Menu`
- 🏭 Component Generator → `[+] Component Generator`
- 📚 Component Catalog → `[#] Component Catalog`
- ⚙️ Settings → `[~] Settings`
- 📊 Analytics Dashboard → `[%] Analytics Dashboard`
- 🤖 AI Assistant → `[*] AI Assistant`
- 📋 Activity Log → `[LOG] Activity Log`

## Other Elements
- ⭐ Star Rating → `*` (asterisk)
- ⚙️ Loading/Processing → `[...]`
- 🚀 Generate/Launch → `[>>]`

## Environment Variable
To disable emojis and use ASCII icons, set:
```bash
export TERMINAL_EMOJIS=false
```

This is automatically set in:
- `run-terminal-ui.sh`
- `npm run ui:full`
- Terminal UI command integration

## Usage
The Terminal UI automatically detects if emojis should be used based on the `TERMINAL_EMOJIS` environment variable. When set to `false`, all emojis are replaced with ASCII alternatives for better compatibility across different terminal emulators.