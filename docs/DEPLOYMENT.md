# Deployment Guide (Template Project)

This guide describes how to package and deploy a Qlik Sense extension based on the QS-Ext-Jump-Start template.

## Building the Extension

To compile the deployment package, run:

```bash
npm run package
```

This places the compiled files in a folder using your extension name and appending `-ext`.

## Creating the Deployment Package

Zip the contents of the `<your extension name>-ext` directory to create a deployment package for Qlik Sense.

## Deploying to Qlik Sense Enterprise

1. Open the Qlik Sense Management Console (QMC)
2. Go to Extensions
3. Click "Import" and select your zipped package file
4. The extension will be available in your Qlik Sense apps

## Deploying to your Qlik Sense Cloud tenant

1. Navigate to your Qlik Sense Cloud Tenant Administration section
2. Go to Extensions
3. Click "Add" and upload your package file
4. The extension will be available in your Qlik Sense apps

## Troubleshooting

If you encounter issues during deployment, check:

- Package file integrity
- Extension naming conflicts
- Administrator permissions
- Qlik Sense version compatibility

For more help, see [Support](../.github/support.md).
