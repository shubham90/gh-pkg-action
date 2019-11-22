import {
  AccessMapping,
  LocationServiceData
} from "azure-devops-node-api/interfaces/LocationsInterfaces";


export interface PackagingAccessMapping {
  uri: string;
  isPublic: boolean;
  isDefault: boolean;
}

export function getPackagingAccessMappings(
  locationServiceData: LocationServiceData
): PackagingAccessMapping[] {
  const commonAccessMappings = ["CodexAccessMapping", "VstsAccessMapping"];

  return locationServiceData.accessMappings.map(accessMapping => {
    const isDefaultAccessMapping =
      accessMapping.moniker === locationServiceData.defaultAccessMappingMoniker;

    const isCommonAccessMapping =
      commonAccessMappings.indexOf(accessMapping.moniker) > -1;

    return {
      uri: toNormalizedAccessUri(accessMapping),

      isPublic: isDefaultAccessMapping || isCommonAccessMapping,

      isDefault: isDefaultAccessMapping
    };
  });
}


function toNormalizedAccessUri(accessMapping: AccessMapping): string {

  if (!accessMapping.virtualDirectory) {
    return ensureTrailingSlash(accessMapping.accessPoint);
  }

  return ensureTrailingSlash(
    ensureTrailingSlash(accessMapping.accessPoint) +
      accessMapping.virtualDirectory
  );
}

function ensureTrailingSlash(uri: string) {
  return uri.endsWith("/") ? uri : uri + "/";
}
