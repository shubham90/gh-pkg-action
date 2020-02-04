# Nuget Auth Action

This action authenticates your nuget azure artifacts feed.

## Inputs

### `azure-devops-org-url`

**Required** The azure devops url.

### `azure-devops-token`

**Required** The azure devops PAT.

## Example usage

```
uses: shubham90/gh-pkg-action@v2
  with:
    azure-devops-org-url: 'https://dev.azure.com/account_name'
    azure-devops-token: '${{ secrets.AZURE_DEVOPS_TOKEN }}'
```
