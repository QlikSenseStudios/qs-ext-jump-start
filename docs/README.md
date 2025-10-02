# Extension Features Documentation

This directory contains comprehensive documentation for all extension features and capabilities.

## 🚀 Getting Started

| Document                                                   | Purpose                  | When to Use                         |
| ---------------------------------------------------------- | ------------------------ | ----------------------------------- |
| [**README.md**](../README.md)                              | Quick start and overview | First-time setup, feature overview  |
| [**QLIK_CLOUD_SETUP.md**](./QLIK_CLOUD_SETUP.md)           | Qlik Cloud configuration | Setting up in Qlik Cloud            |
| [**QLIK_ENTERPRISE_SETUP.md**](./QLIK_ENTERPRISE_SETUP.md) | Enterprise configuration | Setting up in Qlik Sense Enterprise |

## 🏗️ Architecture & Features

### Core Systems

| Feature                   | Documentation                                                                                            | Description                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Component System**      | Built-in (see `src/components/`)                                                                         | Reusable UI components for consistent development         |
| **Template System**       | Built-in (see `src/templates/`)                                                                          | Standardized UI patterns and layouts                      |
| **Declarative Rendering** | [**TESTING.md#declarative-rendering**](./TESTING.md#extension-declarative-rendering-non-functional-beta) | NON-FUNCTIONAL BETA - Configuration-driven UI composition |

### Development Tools

| Tool                  | Documentation                                      | Description                                                              |
| --------------------- | -------------------------------------------------- | ------------------------------------------------------------------------ |
| **Testing Framework** | [**TESTING.md**](./TESTING.md)                     | Playwright E2E testing with Nebula hub and JSON configuration validation |
| **Debug Utilities**   | Built-in (see `src/utils.js`)                      | Consolidated debug detection and conditional logging                     |
| **Project Structure** | [**PROJECT_STRUCTURE.md**](./PROJECT_STRUCTURE.md) | File organization and purpose                                            |
| **Workflows**         | [**WORKFLOWS.md**](./WORKFLOWS.md)                 | Common development tasks                                                 |

## 📋 Reference

| Document                             | Purpose               | When to Use                         |
| ------------------------------------ | --------------------- | ----------------------------------- |
| [**CHANGELOG.md**](./CHANGELOG.md)   | Version history       | Understanding updates and migration |
| [**DEPLOYMENT.md**](./DEPLOYMENT.md) | Production deployment | Preparing for production release    |

## 🎯 Feature Deep Dives

### Component System

Located in `src/components/`, provides:

- **Header Components** - Standardized titles and navigation
- **Table Components** - Data display with sorting and responsiveness
- **Error Handling** - User-friendly error messages and recovery
- **No-Data States** - Guidance when configuration is incomplete

**Quick Start:** Import components from `src/components` and use directly in your extension.

### Template System

Located in `src/templates/`, provides:

- **Base Templates** - Foundation containers and layouts
- **State Templates** - Extension state management (data, no-data, error, loading)
- **Table Templates** - Advanced table patterns (enhanced, responsive, paginated)
- **Template Registry** - Centralized access to all templates

**Quick Start:** Use `createExtensionStateTemplate()` for consistent state rendering.

### Declarative Rendering

Located in `src/rendering/`, provides:

- **JSON Configurations** - Define layouts without code
- **Conditional Rendering** - Show/hide components based on data
- **Layout Strategies** - Grid, flex, and responsive layouts
- **Template Integration** - Works seamlessly with existing templates

**Quick Start:** Enable in extension properties → Declarative Rendering section.

## 🔍 Finding What You Need

### I want to...

**Get started quickly** → [README.md](../README.md)

**Set up my environment** → [QLIK_CLOUD_SETUP.md](./QLIK_CLOUD_SETUP.md) or [QLIK_ENTERPRISE_SETUP.md](./QLIK_ENTERPRISE_SETUP.md)

**Understand the file structure** → [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

**Learn about testing** → [TESTING.md](./TESTING.md)

**Create dynamic UIs with configuration** → [TESTING.md#declarative-rendering](./TESTING.md#extension-declarative-rendering-non-functional-beta) _(NON-FUNCTIONAL BETA)_

**Customize the extension** → [WORKFLOWS.md](./WORKFLOWS.md)

**Deploy to production** → [DEPLOYMENT.md](./DEPLOYMENT.md)

**See what's new** → [CHANGELOG.md](./CHANGELOG.md)

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on contributing to this template project.

## 📞 Support

For questions and support:

- Check existing documentation first
- Review the [Knowledge Base](../KNOWLEDGE_BASE.md)
- Check the [TODO.md](../TODO.md) for known issues and planned features
