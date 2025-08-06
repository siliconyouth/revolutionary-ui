# AI Interactive Wizard Test Plan

## Overview
This document outlines the comprehensive testing plan for the Revolutionary UI AI Interactive Wizard with browser session authentication.

## Test Environment Setup

### Prerequisites
1. Node.js v18+ installed
2. Revolutionary UI built (`npm run build`)
3. Internet connection for AI services

### Test Execution
```bash
# Run the AI interactive wizard
./bin/revolutionary-ui ai-interactive

# Or using npm
npm run cli ai-interactive
```

## Test Scenarios

### 1. Authentication Flow Testing

#### Test 1.1: Browser Session Authentication (NEW)
1. Run `revolutionary-ui ai-interactive`
2. When prompted for authentication, select "🌐 Browser Session (No API limits)"
3. Verify:
   - Browser opens to claude.ai
   - Local server starts on port 9876
   - Instructions page shows correctly
   - Session key input form works
   - Authentication succeeds after pasting key
   - Session persists across CLI restarts

#### Test 1.2: API Key Authentication
1. Run `revolutionary-ui ai-interactive`
2. Select "🔑 Use API Key"
3. Enter a valid Anthropic API key
4. Verify authentication succeeds

#### Test 1.3: Skip Authentication
1. Run `revolutionary-ui ai-interactive`
2. Select "❌ Skip for now"
3. Verify wizard continues without AI features

### 2. AI Assistance Testing

#### Test 2.1: Project Analysis with AI
1. Authenticate with browser session
2. Let AI analyze the project
3. Verify AI provides:
   - Project summary
   - Framework detection
   - Recommendations
   - Suggested components

#### Test 2.2: Framework Selection
1. When prompted for framework choice
2. Verify AI:
   - Explains each framework option
   - Recommends best choice for project
   - Provides reasoning

#### Test 2.3: Feature Configuration
1. For each feature option
2. Verify AI:
   - Explains what the feature does
   - Recommends based on project needs
   - Shows default values

### 3. Component Generation Testing

#### Test 3.1: Generate with Natural Language
1. Use prompt: "Create a modern dashboard with charts"
2. Verify AI:
   - Understands the request
   - Suggests appropriate factory
   - Generates valid component code

#### Test 3.2: Generate with Options
1. Select manual configuration
2. For each option, verify AI provides guidance
3. Generate component and verify output

### 4. Error Handling Testing

#### Test 4.1: Invalid Session Key
1. Try authentication with invalid session
2. Verify graceful error handling and retry option

#### Test 4.2: Session Expiration
1. Use expired session (if available)
2. Verify re-authentication prompt

#### Test 4.3: Network Issues
1. Disconnect internet after auth
2. Verify offline fallback behavior

### 5. Command Testing

#### Test 5.1: AI-Enhanced Analyze
```bash
revolutionary-ui analyze --ai
```
Verify AI insights are provided

#### Test 5.2: AI-Enhanced Setup
```bash
revolutionary-ui setup --with-ai
```
Verify AI recommendations during setup

#### Test 5.3: AI Generate
```bash
revolutionary-ui ai-generate "create a login form"
```
Verify component generation works

### 6. Status and Management

#### Test 6.1: Check Auth Status
```bash
revolutionary-ui ai-auth --status
```
Verify correct status display

#### Test 6.2: Logout
```bash
revolutionary-ui ai-auth --logout
```
Verify session is cleared

## Expected Behaviors

### Successful Authentication Flow
1. User selects browser session
2. Browser opens automatically
3. Clear instructions provided
4. Session key accepted
5. "Successfully authenticated" message
6. AI features available immediately

### AI Recommendations
- Context-aware suggestions
- Best practices explained
- Sensible defaults provided
- Educational explanations
- Project-specific advice

### Error Recovery
- Clear error messages
- Retry options available
- Fallback to non-AI mode
- No data loss on errors

## Test Results Template

```markdown
### Test Run: [Date]
- **Tester**: [Name]
- **Version**: 3.4.0
- **Environment**: [OS/Node version]

#### Authentication Tests
- [ ] Browser Session Auth - Success
- [ ] API Key Auth - Success
- [ ] Skip Auth - Success

#### AI Feature Tests
- [ ] Project Analysis - Working
- [ ] Recommendations - Accurate
- [ ] Component Generation - Valid output

#### Error Handling
- [ ] Invalid session - Handled gracefully
- [ ] Network errors - Proper fallback

#### Overall Result
- **Pass/Fail**: 
- **Issues Found**: 
- **Notes**: 
```

## Automated Testing

For CI/CD integration:
```bash
# Run in non-interactive mode
CI=true revolutionary-ui ai-interactive --preset=default

# Test with mock responses
MOCK_AI=true npm test
```

## Performance Metrics

Track:
- Authentication time
- AI response latency
- Component generation speed
- Memory usage
- Error rates

## Reporting Issues

If issues are found:
1. Note the exact error message
2. Capture console output
3. Check ~/.revolutionary-ui/logs/
4. Report at: https://github.com/yourusername/revolutionary-ui/issues