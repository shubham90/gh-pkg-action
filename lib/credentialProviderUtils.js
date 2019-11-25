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
const fse = __importStar(require("fs-extra"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const process = __importStar(require("process"));
const core = require("@actions/core");
const locationUtils_1 = require("./locationUtils");
const packagingAccessMapping_1 = require("./packagingAccessMapping");
const webapi_1 = require("./webapi");
const CRED_PROVIDER_PREFIX_ENVVAR = "VSS_NUGET_URI_PREFIXES";
const CRED_PROVIDER_ACCESS_TOKEN_ENVVAR = "VSS_NUGET_ACCESSTOKEN";
function getTaskCredProviderPluginsDir() {
    let taskRootPath = path.dirname(path.dirname(__dirname));
    return path.join(taskRootPath, "CredentialProviderV2", "plugins");
}
exports.getTaskCredProviderPluginsDir = getTaskCredProviderPluginsDir;
function installCredProviderToUserProfile() {
    return __awaiter(this, void 0, void 0, function* () {
        const taskPluginsPir = getTaskCredProviderPluginsDir();
        const userPluginsDir = getUserProfileNuGetPluginsDir();
        console.log("user plugin dir: " + userPluginsDir);
        const netCoreSource = path.join(taskPluginsPir, "netcore", "CredentialProvider.Microsoft");
        const netCoreDest = path.join(userPluginsDir, "netcore", "CredentialProvider.Microsoft");
        yield copyCredProviderFiles(netCoreSource, netCoreDest);
        console.log();
        // Only install netfx plugin on Windows
        const isWin = process.platform === "win32";
        console.log("process actual: " + process.platform);
        console.log("process:" + isWin);
        if (isWin) {
            const netFxSource = path.join(taskPluginsPir, "netfx", "CredentialProvider.Microsoft");
            console.log(`netfxSource: '${netFxSource}'`);
            const netFxDest = path.join(userPluginsDir, "netfx", "CredentialProvider.Microsoft");
            console.log(`netFxDest: '${netFxDest}'`);
            yield copyCredProviderFiles(netFxSource, netFxDest);
            console.log();
        }
    });
}
exports.installCredProviderToUserProfile = installCredProviderToUserProfile;
function copyCredProviderFiles(source, dest) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Removing '${dest}' before copying from '${source}' since overwrite is enabled`);
        try {
            yield fse.remove(dest);
        }
        catch (ex) {
            throw new Error();
        }
        console.log(`Copying from '${source}' to '${dest}'`);
        try {
            yield fse.copy(source, dest, {
                recursive: true,
                overwrite: false,
                errorOnExist: true // we should have removed the destination already and there shouldn't be any files
            });
        }
        catch (ex) {
            console.log(ex);
            throw new Error(ex.message);
        }
    });
}
function getUserProfileNuGetPluginsDir() {
    const homeDir = os.homedir();
    console.log("homedir: " + homeDir);
    return path.join(homeDir, ".nuget", "plugins");
}
exports.getUserProfileNuGetPluginsDir = getUserProfileNuGetPluginsDir;
function configureCredProvider(protocol) {
    return __awaiter(this, void 0, void 0, function* () {
        const connectionData = yield locationUtils_1.getConnectionDataForProtocol(protocol);
        const packagingAccessMappings = packagingAccessMapping_1.getPackagingAccessMappings(connectionData.locationServiceData);
        const accessToken = webapi_1.getSystemAccessToken();
        const allPrefixes = [
            ...new Set(packagingAccessMappings.map(prefix => prefix.uri))
        ];
        const publicPrefixes = [
            ...new Set(packagingAccessMappings
                .filter(prefix => prefix.isPublic)
                .map(prefix => prefix.uri))
        ];
        publicPrefixes.forEach(publicPrefix => console.log("  " + publicPrefix));
        console.log();
        core.exportVariable(CRED_PROVIDER_PREFIX_ENVVAR, allPrefixes.join(";"));
        core.exportVariable(CRED_PROVIDER_ACCESS_TOKEN_ENVVAR, accessToken);
    });
}
exports.configureCredProvider = configureCredProvider;
