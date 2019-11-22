"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getPackagingAccessMappings(locationServiceData) {
    const commonAccessMappings = ["CodexAccessMapping", "VstsAccessMapping"];
    return locationServiceData.accessMappings.map(accessMapping => {
        const isDefaultAccessMapping = accessMapping.moniker === locationServiceData.defaultAccessMappingMoniker;
        const isCommonAccessMapping = commonAccessMappings.indexOf(accessMapping.moniker) > -1;
        return {
            uri: toNormalizedAccessUri(accessMapping),
            isPublic: isDefaultAccessMapping || isCommonAccessMapping,
            isDefault: isDefaultAccessMapping
        };
    });
}
exports.getPackagingAccessMappings = getPackagingAccessMappings;
function toNormalizedAccessUri(accessMapping) {
    if (!accessMapping.virtualDirectory) {
        return ensureTrailingSlash(accessMapping.accessPoint);
    }
    return ensureTrailingSlash(ensureTrailingSlash(accessMapping.accessPoint) +
        accessMapping.virtualDirectory);
}
function ensureTrailingSlash(uri) {
    return uri.endsWith("/") ? uri : uri + "/";
}
