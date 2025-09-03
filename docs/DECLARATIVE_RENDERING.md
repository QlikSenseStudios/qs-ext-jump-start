# Declarative Rendering System

## Overview

The Declarative Rendering System enables configuration-driven UI composition for Qlik Sense extensions. This powerful feature allows you to define complex, dynamic interfaces using simple JSON configurations, building upon the extension's template foundation to provide flexible, data-driven interface generation.

## Key Features

### 🏗️ Configuration-Driven Architecture
- **JSON-based configurations** define complete UI layouts
- **Template composition** using the extension's template system
- **Conditional rendering** based on data state and context
- **Layout strategies** (single, grid, flex, auto)

### 🔧 Developer Experience
- **Type-safe configurations** with JSDoc annotations
- **Validation system** for configuration integrity
- **Builder pattern** for programmatic configuration creation
- **Extensive examples** and presets

### 🎯 Production Ready
- **Backward compatibility** with existing template system
- **Opt-in activation** through extension properties
- **Performance optimized** with component caching
- **Error resilient** with graceful fallback to standard rendering

## Architecture

```
src/rendering/
├── declarative-renderer.js    # Core rendering engine
├── declarative-config.js      # Configuration schemas & validation
├── declarative-integration.js # Extension integration layer
├── declarative-examples.js    # Example configurations
├── declarative-styles.css     # Styling for declarative components
└── index.js                   # Module exports
```

## Quick Start

### 1. Enable Declarative Rendering

Add declarative rendering properties to your extension:

```javascript
// In QAE properties configuration
declarativeRendering: {
  type: 'items',
  label: 'Declarative Rendering (Beta)',
  items: {
    useDeclarativeRendering: {
      type: 'boolean',
      label: 'Enable Declarative Rendering',
      ref: 'props.useDeclarativeRendering',
      defaultValue: false,
    },
    declarativeConfig: {
      type: 'string',
      component: 'dropdown',
      label: 'Rendering Configuration',
      ref: 'props.declarativeConfig',
      options: [
        { value: 'dataTableView', label: 'Data Table View' },
        { value: 'dashboardView', label: 'Dashboard View' },
        { value: 'flexibleContentView', label: 'Flexible Content View' },
      ],
      defaultValue: 'dataTableView',
      show: (data) => data.props?.useDeclarativeRendering,
    },
  },
}
```

### 2. Use in Extension Component

The declarative rendering system is automatically integrated:

```javascript
// Declarative Rendering Path (automatic when enabled)
const extensionState = {
  state: 'data', // or 'no-data', 'error', 'loading'
  data: processedData,
  inSelection,
  layout,
  element,
};

// Renders declaratively if enabled, falls back to templates
const success = renderExtensionAuto(extensionState, {
  configId: layout.props?.declarativeConfig || 'dataTableView',
  preferDeclarative: true,
});
```

## Configuration System

### Basic Configuration Structure

```javascript
const config = {
  layout: 'grid',           // Layout strategy
  options: {                // Layout-specific options
    columns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
  },
  components: [             // Component definitions
    {
      id: 'header-section',
      type: 'template',
      template: 'base.createSectionTemplate',
      props: {
        title: '{{title}}',  // Template string
        className: 'main-header',
      },
    },
    // ... more components
  ],
  styles: {},               // Global styles
  events: {},               // Event handlers
};
```

### Component Types

#### Template Components
Use existing template system:

```javascript
{
  id: 'data-table',
  type: 'template',
  template: 'table.createResponsiveTableTemplate',
  props: {
    dimHeader: '{{dimHeader}}',
    measHeader: '{{measHeader}}',
    localData: '{{localData}}',
    responsive: true,
  },
}
```

#### Custom Components
Create custom HTML elements:

```javascript
{
  id: 'custom-metric',
  type: 'custom',
  props: {
    tag: 'div',
    className: 'metric-display',
    content: 'Total: {{totalRecords}} records',
    attributes: {
      'data-value': '{{totalRecords}}',
    },
  },
}
```

#### Conditional Components
Render based on data state:

```javascript
{
  id: 'content-area',
  type: 'conditional',
  conditional: {
    condition: 'hasData',
    ifTrue: {
      id: 'table-view',
      type: 'template',
      template: 'table.createEnhancedTableTemplate',
      // ... props
    },
    ifFalse: {
      id: 'no-data-view',
      type: 'template',
      template: 'state.createNoDataStateTemplate',
      // ... props
    },
  },
}
```

### Layout Strategies

#### Grid Layout
```javascript
{
  layout: 'grid',
  options: {
    columns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
}
```

#### Flex Layout
```javascript
{
  layout: 'flex',
  options: {
    direction: 'column',
    gap: '1rem',
    wrap: 'nowrap',
  },
}
```

#### Single Layout
```javascript
{
  layout: 'single',  // Simple block layout
}
```

## Predefined Configurations

### Data Table View (Default)
```javascript
extensionConfigurations.dataTableView
```
Standard data table with header and responsive layout.

### Dashboard View
```javascript
extensionConfigurations.dashboardView
```
Grid-based dashboard with summary cards and data sections.

### Flexible Content View
```javascript
extensionConfigurations.flexibleContentView
```
Adaptive layout that changes based on content and screen size.

## Template String System

Use `{{variable}}` syntax for dynamic values:

```javascript
{
  template: 'base.createSectionTemplate',
  props: {
    title: '{{title}}',           // From context
    content: 'Records: {{totalRecords}}',
  },
}
```

Context automatically includes:
- `extensionState`: Current state ('no-data', 'data', 'error', 'loading')
- `inSelection`: Whether in selection mode
- `hasData`: Whether data is available
- `totalRecords`: Number of data records
- `dimCount`, `measCount`: Dimension/measure counts
- All layout data properties

## Builder Pattern API

Create configurations programmatically:

```javascript
import { createConfigBuilder } from './rendering';

const config = createConfigBuilder('grid')
  .setOptions({ 
    columns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem' 
  })
  .addComponent({
    id: 'summary',
    type: 'template',
    template: 'base.createCardTemplate',
    props: { title: 'Summary' },
  })
  .addComponent({
    id: 'data-table',
    type: 'conditional',
    conditional: {
      condition: 'hasData',
      ifTrue: { /* table config */ },
      ifFalse: { /* no-data config */ },
    },
  })
  .setStyles({ backgroundColor: '#f8f9fa' })
  .build();
```

## Example Configurations

### Simple Data Table
```javascript
import { createExampleConfig } from './rendering';

const simpleConfig = createExampleConfig('simple', {
  title: 'My Data Table',
  responsive: true,
});
```

### Card Layout
```javascript
const cardConfig = createExampleConfig('card', {
  columns: 'repeat(auto-fit, minmax(250px, 1fr))',
  showSummary: true,
});
```

### Sidebar Layout
```javascript
const sidebarConfig = createExampleConfig('sidebar', {
  sidebarWidth: '300px',
  showInfo: true,
});
```

## Validation System

Configurations are automatically validated:

```javascript
import { validateRenderConfig } from './rendering';

const validation = validateRenderConfig(config);
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}
```

## Integration with Existing Systems

### Template System Compatibility
Declarative rendering uses the existing template system:
- All `template` components reference existing templates
- Template presets are automatically available
- Fallback to template rendering if declarative fails

### State Management
Integrates with existing state management:
- Uses same selection state handling
- Preserves existing event handlers
- Maintains data flow patterns

### Styling
Extends existing CSS with declarative-specific styles:
- Responsive grid and flex layouts
- Component-specific styling
- Accessibility enhancements
- Dark mode support

## Performance Considerations

### Component Caching
- Components are cached by ID to avoid recreating unchanged elements
- Cache can be cleared when needed for dynamic updates

### Lazy Evaluation
- Templates are only created when needed
- Conditional components only render active branch

### Memory Management
- Automatic cleanup of event handlers
- WeakMap usage for DOM associations

## Testing

The declarative rendering system maintains 100% compatibility:
- All existing tests pass (40/40)
- Declarative rendering is opt-in and doesn't affect default behavior
- Fallback ensures robustness

## Migration Guide

### From Template System
1. Enable declarative rendering in properties
2. Choose or create appropriate configuration
3. Test thoroughly with your data

### Creating Custom Configurations
1. Start with existing examples
2. Use builder pattern for complex layouts
3. Validate configurations before deployment

## Future Enhancements

The declarative rendering system provides foundation for:
- **Performance optimization** with template memoization
- **Advanced animations** and transitions
- **Dynamic configuration updates** at runtime
- **Visual configuration editor** for non-developers

## API Reference

### Core Classes
- `DeclarativeRenderer`: Main rendering engine
- `DeclarativeExtensionRenderer`: Extension integration
- `ConfigurationBuilder`: Builder pattern implementation

### Functions
- `renderDeclarative()`: Direct rendering function
- `createDeclarativeExtension()`: Factory function
- `renderExtensionAuto()`: Automatic mode detection
- `validateRenderConfig()`: Configuration validation

### Configuration Types
- `RenderConfig`: Main configuration interface
- `ComponentConfig`: Component definition interface
- `ConditionalConfig`: Conditional rendering interface

## Examples in the Wild

The `src/rendering/declarative-examples.js` file contains complete working examples demonstrating:
- Simple table layouts
- Complex dashboard grids
- Responsive sidebar layouts
- Custom component creation

## Conclusion

The Declarative Rendering System provides a powerful, flexible solution for creating dynamic, data-driven UIs while maintaining full backward compatibility with existing template and component systems. The configuration-driven approach enables rapid development and consistent user experiences across different extension states.
