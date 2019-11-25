"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const api = __importStar(require("azure-devops-node-api"));
const core = require("@actions/core");
function getWebApiWithProxy(serviceUri, accessToken, options = {}) {
    const credentialHandler = api.getBasicHandler("vsts", accessToken);
    const defaultOptions = {
        allowRetries: true,
        maxRetries: 5
    };
    return new api.WebApi(serviceUri, credentialHandler, Object.assign({}, defaultOptions, options));
}
exports.getWebApiWithProxy = getWebApiWithProxy;
function getSystemAccessToken() {
    return core.getInput("azure-devops-token");
}
exports.getSystemAccessToken = getSystemAccessToken;
function getCollectionUrl() {
    return core.getInput("azure-devops-org-url");
}
exports.getCollectionUrl = getCollectionUrl;
