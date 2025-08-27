# Cursor IDE Setup Guide for QS-Ext-Jump-Start

This guide provides specific instructions for using [Cursor IDE](https://cursor.sh/) with the QS-Ext-Jump-Start template for optimal Qlik Sense extension development.

## 🎯 Why Cursor IDE?

Cursor IDE is an AI-powered code editor built on VS Code that provides:
- Advanced AI code completion and suggestions
- Contextual codebase understanding
- Intelligent refactoring and debugging assistance
- Seamless integration with existing VS Code extensions

## 🚀 Quick Setup

### 1. Install Cursor IDE

Download and install Cursor from [cursor.sh](https://cursor.sh/)

### 2. Open the Project

```bash
# Clone your repository
git clone <your-repo-url>
cd <your-repo-name>

# Open in Cursor
cursor .
```

### 3. Initial Configuration

The project includes Cursor-specific configurations:

- **`.cursorignore`** - Optimizes indexing by excluding unnecessary files
- **`.cursor/settings.json`** - Cursor-specific IDE settings
- **Enhanced `.aiconfig`** - AI model preferences and project context

## 🔧 Configuration Details

### AI Model Settings

The project is configured to use:
- **Primary**: Claude 3.5 Sonnet (for complex reasoning)
- **Fallback**: GPT-4o-mini (for faster responses)

You can customize these in `.aiconfig`:

```yaml
ai:
  preferred_model: claude-3-5-sonnet-20241022
  fallback_model: gpt-4o-mini
  cursor_compatible: true
```

### Optimized Indexing

The `.cursorignore` file excludes:
- `node_modules/` and build artifacts
- Test reports and temporary files
- Large binary files
- Log files

This ensures fast, relevant AI suggestions.

### Enhanced VS Code Settings

The `.vscode/settings.json` includes Cursor-optimized settings:
- Inline suggestions enabled
- Quick suggestions with minimal delay
- Auto-imports for JavaScript
- Qlik Sense file associations (`.qvs` → SQL)

## 💡 AI-Powered Development Workflow

### 1. Context-Aware Code Completion

Cursor understands the Qlik Sense extension structure:

```javascript
// Type "use" and Cursor will suggest Qlik-specific hooks
import { useElement, useModel, useSelections } from '@nebula.js/stardust';
```

### 2. Intelligent Property Panel Creation

Ask Cursor to help create property configurations:

```
"Create a property panel section for chart colors with validation"
```

### 3. Test Generation

Generate Playwright tests for your extension:

```
"Generate a test that verifies selection behavior in this extension"
```

### 4. Documentation Generation

Create JSDoc comments automatically:

```
"Add comprehensive JSDoc comments to this function"
```

## 🎨 Recommended Cursor Features

### Chat with Codebase

Use `Cmd/Ctrl + L` to open chat and ask questions like:
- "How does the selection system work in this extension?"
- "Show me all the property panel configurations"
- "What Playwright tests cover the error states?"

### Composer (Multi-file Editing)

Use `Cmd/Ctrl + I` to make changes across multiple files:
- "Rename this extension from 'jump-start' to 'my-dashboard'"
- "Add TypeScript support to the entire project"
- "Update all tests to use the new data format"

### Apply Changes

Use `Cmd/Ctrl + K` to generate code in place:
- Select a function and ask to "optimize for performance"
- Highlight CSS and request "make this responsive"

## 🔍 Project-Specific AI Prompts

The `.aiconfig` includes useful prompt templates:

1. **Code Understanding**: "Explain how this Qlik Sense extension works to a new developer"
2. **Testing**: "Debug this Playwright test failure"
3. **Enhancement**: "Add TypeScript support to this extension"
4. **Performance**: "Optimize this code for performance and accessibility"
5. **Documentation**: "Create documentation for a new property panel section"

## 🐛 Troubleshooting

### Slow AI Responses

1. Check if `.cursorignore` is properly configured
2. Reindex the codebase: `Cmd/Ctrl + Shift + P` → "Cursor: Reindex"
3. Clear cache: `Cmd/Ctrl + Shift + P` → "Cursor: Clear Cache"

### Missing Context

1. Ensure `.aiconfig` includes all relevant documentation paths
2. Check that important files aren't excluded in `.cursorignore`
3. Use explicit file references in your prompts

### Extension-Specific Issues

1. **Nebula CLI not recognized**: Make sure `node_modules` is not excluded from search
2. **Qlik API suggestions missing**: Verify the Qlik context keywords in `.cursor/settings.json`
3. **Test failures**: Use the project-specific Playwright setup documentation

## 🔗 Useful Cursor Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + L` | Open Chat |
| `Cmd/Ctrl + I` | Open Composer |
| `Cmd/Ctrl + K` | Generate Code |
| `Cmd/Ctrl + Shift + L` | Chat with Selection |
| `Tab` | Accept AI Suggestion |
| `Cmd/Ctrl + →` | Accept Word |

## 📚 Additional Resources

- [Cursor Documentation](https://docs.cursor.sh/)
- [Qlik Sense Developer Portal](https://qlik.dev/)
- [Nebula.js Documentation](https://qlik.dev/extend/)
- [Project Knowledge Base](../KNOWLEDGE_BASE.md)

## 🤝 Contributing

When contributing to this template:

1. Test changes with Cursor IDE
2. Update AI configurations if needed
3. Document new features in this guide
4. Ensure `.cursorignore` patterns remain optimal

---

For general development setup, see the main [README.md](../README.md) and [setup guides](./README.md).
