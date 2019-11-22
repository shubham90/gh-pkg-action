import * as protocols from "./protocols";
import * as api from "./webapi";
import { ConnectOptions } from "azure-devops-node-api/interfaces/common/VSSInterfaces";
import { ConnectionData } from "azure-devops-node-api/interfaces/LocationsInterfaces";

/**

 * Gets the raw connection data (direct representation of _apis/connectionData) for the service hosting a particular protocol

 * @param protocolType The packaging protocol, e.g. 'NuGet'

 */

export async function getConnectionDataForProtocol(
  protocolType: protocols.ProtocolType
): Promise<ConnectionData> {
  const accessToken = api.getSystemAccessToken();
  const areaId = protocols.getAreaIdForProtocol(protocolType);
  const serviceUri = await getServiceUriFromAreaId(areaId, accessToken);
  // Get _apis/connectionData from the packaging service
  const webApi = api.getWebApiWithProxy(serviceUri, accessToken);
  const locationApi = await webApi.getLocationsApi();
  const connectionData = await locationApi.getConnectionData(
    ConnectOptions.IncludeServices
  );
  return connectionData;
}

export async function getPackagingRouteUrl(
  protocolType: protocols.ProtocolType,
  apiVersion: string,
  locationGuid: string,
  feedId: string,
  project: string
): Promise<string> {
      const accessToken = api.getSystemAccessToken();

      const areaId = protocols.getAreaIdForProtocol(protocolType);

      const serviceUri = await getServiceUriFromAreaId(areaId, accessToken);

      const webApi = api.getWebApiWithProxy(serviceUri, accessToken);

      const data = await webApi.vsoClient.getVersioningData(
        apiVersion,
        protocols.ProtocolType[protocolType],
        locationGuid,
        { feedId: feedId, project: project }
      );
      return data.requestUrl;
}

async function getServiceUriFromAreaId(
  areaId: string,
  accessToken: string
): Promise<string> {
  const tfsCollectionUrl = api.getCollectionUrl();
  const webApi = api.getWebApiWithProxy(tfsCollectionUrl, accessToken);
  const locationApi = await webApi.getLocationsApi();
  console.log(`Getting URI for area ID ${areaId} from ${tfsCollectionUrl}`);

  try {
    const serviceUriFromArea = await locationApi.getResourceArea(areaId);

    console.log(
      `Acquired the resource area: ${JSON.stringify(serviceUriFromArea)}`
    );

    return serviceUriFromArea.locationUrl;
  } catch (error) {
    console.log(`Failed to obtain the service URI for area ID ${areaId}`);

    console.log(JSON.stringify(error));

    throw error;
  }
}
