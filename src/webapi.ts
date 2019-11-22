import * as api from "azure-devops-node-api";
const core = require("@actions/core");

import { IRequestOptions } from "azure-devops-node-api/interfaces/common/VsoBaseInterfaces";

export function getWebApiWithProxy(
  serviceUri: string,
  accessToken: string,
  options: IRequestOptions = {}
): api.WebApi {
  const credentialHandler = api.getBasicHandler("vsts", accessToken);

  const defaultOptions: IRequestOptions = {
    allowRetries: true,

    maxRetries: 5
  };

  return new api.WebApi(serviceUri, credentialHandler, {
    ...defaultOptions,
    ...options
  });
}

export function getSystemAccessToken(): string {
  return core.getInput("azure-devops-token");
}

export function getCollectionUrl(): string {
    return core.getInput("azure-devops-org-url");
  }