"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const protocols = __importStar(require("./protocols"));
const api = __importStar(require("./webapi"));
const VSSInterfaces_1 = require("azure-devops-node-api/interfaces/common/VSSInterfaces");
/**

 * Gets the raw connection data (direct representation of _apis/connectionData) for the service hosting a particular protocol

 * @param protocolType The packaging protocol, e.g. 'NuGet'

 */
function getConnectionDataForProtocol(protocolType) {
    return __awaiter(this, void 0, void 0, function* () {
        const accessToken = api.getSystemAccessToken();
        const areaId = protocols.getAreaIdForProtocol(protocolType);
        const serviceUri = yield getServiceUriFromAreaId(areaId, accessToken);
        // Get _apis/connectionData from the packaging service
        const webApi = api.getWebApiWithProxy(serviceUri, accessToken);
        const locationApi = yield webApi.getLocationsApi();
        const connectionData = yield locationApi.getConnectionData(VSSInterfaces_1.ConnectOptions.IncludeServices);
        return connectionData;
    });
}
exports.getConnectionDataForProtocol = getConnectionDataForProtocol;
function getPackagingRouteUrl(protocolType, apiVersion, locationGuid, feedId, project) {
    return __awaiter(this, void 0, void 0, function* () {
        const accessToken = api.getSystemAccessToken();
        const areaId = protocols.getAreaIdForProtocol(protocolType);
        const serviceUri = yield getServiceUriFromAreaId(areaId, accessToken);
        const webApi = api.getWebApiWithProxy(serviceUri, accessToken);
        const data = yield webApi.vsoClient.getVersioningData(apiVersion, protocols.ProtocolType[protocolType], locationGuid, { feedId: feedId, project: project });
        return data.requestUrl;
    });
}
exports.getPackagingRouteUrl = getPackagingRouteUrl;
function getServiceUriFromAreaId(areaId, accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const tfsCollectionUrl = api.getCollectionUrl();
        const webApi = api.getWebApiWithProxy(tfsCollectionUrl, accessToken);
        const locationApi = yield webApi.getLocationsApi();
        console.log(`Getting URI for area ID ${areaId} from ${tfsCollectionUrl}`);
        try {
            const serviceUriFromArea = yield locationApi.getResourceArea(areaId);
            console.log(`Acquired the resource area: ${JSON.stringify(serviceUriFromArea)}`);
            return serviceUriFromArea.locationUrl;
        }
        catch (error) {
            console.log(`Failed to obtain the service URI for area ID ${areaId}`);
            console.log(JSON.stringify(error));
            throw error;
        }
    });
}
