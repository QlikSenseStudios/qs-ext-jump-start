# Local Context Documentation

## Overview

The context.local.md file contains minimal user and environment information. This file is **not in version control** and follows the **Minimal Context** rule.

## File Structure

### System-Managed Sections
*Automatically maintained - do not edit*
- **Environment Basics**: OS, shell, workspace, date
- **Available Tools**: Living log of discovered capabilities — updated throughout the project as tools are found, used, or found missing. Includes runtimes, shells, OS utilities, and machine-specific commands.

**What goes here vs. elsewhere**:
- Machine-specific tools (only on this machine, may vary by user) → Available Tools in context.local.md
- Project-wide tool conventions (build tools, test frameworks, deployment) → tools/ contexts
- If a tool is unavailable, record the absence and what alternative was used

### User Editable Section
*Between USER EDITABLE SECTION START/END markers*
- **Personal Preferences**: Your minimal essential settings
- **Protected Area**: System will preserve content between markers

## Customization

### Manual Editing
```
Edit between the USER EDITABLE SECTION markers in .ai-toolbox/context.local.md
```

### Prompt-Based Updates
```
"Add [preference] to my local context user preferences"
"Update my local editing preference to [setting]"
```

## Minimal Context Principle

Keep only essential information:
- Environment detection (system managed)
- Essential user preferences (user managed)
- Avoid verbose templates or extensive placeholder text

## System Benefits

- **Minimal and Fast**: Follows Minimal Context rule - only essential information
- **User Control**: Clear USER EDITABLE SECTION for protected customization  
- **Auto-Maintained**: Environment detection handled automatically
- **Project Ready**: Immediately functional for any project type

---

*This documentation reflects the minimal approach - context.local.md contains only essential information following system rules.*