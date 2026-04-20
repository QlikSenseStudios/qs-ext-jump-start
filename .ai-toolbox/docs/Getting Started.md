# Getting Started

Set up this Qlik Sense extension template for your extension project in three steps.

## Step 1: Create your repository

Click **Use this template** on GitHub, or clone and re-point your remote to a new repository.

## Step 2: Initialize your project

Tell your AI agent:
```
Initialize this project maintaining the context in './.ai-toolbox/context.global.md'
```

The initialization workflow will walk you through:
- Extension name, description, and target platform (Qlik Cloud / Enterprise)
- Your work style and contributor name
- Applying your extension identity to `package.json`, `src/meta.json`, and `README.md`
- Removing template-only files (`CONTRIBUTING.md`, `context.development.md`)
- Pointing you to the right Qlik environment setup guide

## Step 3: Start building

After initialization, use this prompt at the start of every session:
```
Always start by loading context from './.ai-toolbox/context.global.md' and follow the established maintenance rules automatically.
```

The AI agent will automatically load your environment, preferences, and Qlik extension domain context from `.ai-toolbox/`. Add this prompt to your AI agent workspace configuration or session opener so you don't have to repeat it.

**Next steps after initialization**:
- Set up your Qlik environment: `docs/QLIK_CLOUD_SETUP.md` or `docs/QLIK_ENTERPRISE_SETUP.md`
- Install dependencies: `npm install`
- Start the dev server: `npm run serve`
- Run tests: `npm test`

**Optional — extend the context system**:
- Define project goals and scope: [Project Context.md](Project%20Context.md)
- Add domain or tool contexts: [Domains.md](Domains.md), [Tools.md](Tools.md)
- Manage your backlog: [Backlog.md](Backlog.md)
- Customize local preferences: [Local Context.md](Local%20Context.md)
