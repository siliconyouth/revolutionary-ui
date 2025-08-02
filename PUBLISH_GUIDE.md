# Publishing Revolutionary UI to npm

🌐 **Website**: [https://revolutionary-ui.com](https://revolutionary-ui.com)

## Prerequisites

1. **npm Account**: Create a free account at https://www.npmjs.com/signup if you don't have one

2. **Login to npm**: Run the following command and enter your credentials:
   ```bash
   npm login
   ```

## Publishing Steps

1. **Run the publish script**:
   ```bash
   ./scripts/publish.sh
   ```

   The script will:
   - Verify you're logged in to npm
   - Run all tests
   - Confirm package details
   - Publish to npm with public access

2. **Alternative: Manual publish**:
   ```bash
   # Login first
   npm login
   
   # Run tests
   npm test
   
   # Publish with public access
   npm publish --access public
   ```

## After Publishing

Once published, your package will be available at:
- Website: https://revolutionary-ui.com
- npm: https://www.npmjs.com/package/@vladimirdukelic/revolutionary-ui
- Install: `npm install @vladimirdukelic/revolutionary-ui`
- Browse Components: https://revolutionary-ui.com/components

## Updating the Package

To publish updates:

1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Commit changes
4. Run `./scripts/publish.sh`

## Troubleshooting

- **E403**: Package name may be taken. Try a different scope or name
- **E401**: Not logged in. Run `npm login`
- **E402**: Payment required for private packages. Use `--access public`

## Support

For issues or questions:
- Website: https://revolutionary-ui.com
- Documentation: https://revolutionary-ui.com/docs
- GitHub: https://github.com/siliconyouth/revolutionary-ui-factory-system/issues
- Email: vladimir@dukelic.com