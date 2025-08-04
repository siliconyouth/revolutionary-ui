# Revolutionary UI Extension Quick Start

## Development Setup

1. **Install dependencies**
   ```bash
   cd vscode-extension/revolutionary-ui
   npm install
   ```

2. **Compile the extension**
   ```bash
   npm run compile
   ```

3. **Run the extension**
   - Press `F5` in VS Code to open a new Extension Development Host window
   - The extension will be loaded in this new window

## Testing

1. **Open a JavaScript/TypeScript project** in the Extension Development Host window

2. **Test Search** 
   - Press `Ctrl+Shift+U` (or `Cmd+Shift+U` on Mac)
   - Type a natural language query like "responsive data table"
   - Select a component from the results

3. **Test Component Explorer**
   - Click the Revolutionary UI icon in the Activity Bar
   - Browse components by category
   - Click to preview, double-click to insert

4. **Test AI Generation**
   - Select some text describing a component
   - Right-click → "Generate Component with AI"
   - Or use Command Palette: `Ctrl+Shift+P` → "Revolutionary UI: Generate Component"

5. **Test IntelliSense**
   - In a JSX/TSX file, type `<` to see component suggestions
   - Select a suggestion to insert the component

## Debugging

- Set breakpoints in the TypeScript files
- Use VS Code's debugging features
- Check the Debug Console for logs

## Building for Production

1. **Install vsce**
   ```bash
   npm install -g vsce
   ```

2. **Package the extension**
   ```bash
   vsce package
   ```
   This creates a `.vsix` file

3. **Publish to marketplace**
   ```bash
   vsce publish
   ```

## Configuration for Testing

Add to your VS Code settings:

```json
{
  "revolutionaryUI.apiUrl": "http://localhost:3000/api",
  "revolutionaryUI.apiKey": "test-key",
  "revolutionaryUI.openAIKey": "sk-..."
}
```

## Project Structure

```
vscode-extension/revolutionary-ui/
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── api/                  # API client
│   ├── providers/            # Tree data providers
│   ├── panels/               # Webview panels
│   └── services/             # Business logic
├── media/                    # Webview assets
├── images/                   # Extension icons
└── package.json             # Extension manifest
```

## Common Issues

1. **Extension not activating**
   - Check activation events in package.json
   - Look for errors in Debug Console

2. **API calls failing**
   - Verify API URL in settings
   - Check network connectivity
   - Ensure API key is valid

3. **Components not showing**
   - Check if API is returning data
   - Verify caching isn't causing stale data
   - Try refreshing with command

## Tips

- Use `console.log` for debugging (appears in Debug Console)
- Test with different frameworks to ensure compatibility
- Check memory usage with large component libraries
- Test offline behavior and error handling