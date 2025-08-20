# Deployment Guide

## Building the Extension

Compile the deployment package:

```bash
npm run package
```

This creates a `qs-ext-jump-start-ext` directory with the packaged extension.

## Creating the Deployment Package

Zip the contents of the `qs-ext-jump-start-ext` directory to create a deployment package.

## Qlik Sense Enterprise

1. Navigate to the Qlik Sense Management Console (QMC)
2. Go to the Extensions section
3. Click "Import" and select the generated package file
4. Once imported, the extension will be available in your applications

## Qlik Sense SaaS

1. Navigate to Qlik Sense SaaS Administration
2. Go to the Extensions section
3. Click "Add" and upload the generated package file
4. Once uploaded, the extension will be available in your applications

## Troubleshooting

If you encounter issues during deployment, check:

- Package file integrity
- Extension naming conflicts
- Administrator permissions
- Qlik Sense version compatibility

For more help, see [Support](../.github/support.md).
