import * as fse from "fs-extra";
import * as os from "os";
import * as path from "path";
import * as process from "process";
const core = require("@actions/core");
import { getConnectionDataForProtocol } from "./locationUtils";
import { getPackagingAccessMappings } from "./packagingAccessMapping";
import { getSystemAccessToken } from "./webapi";
import { ProtocolType } from "./protocols";

const CRED_PROVIDER_PREFIX_ENVVAR = "VSS_NUGET_URI_PREFIXES";

const CRED_PROVIDER_ACCESS_TOKEN_ENVVAR = "VSS_NUGET_ACCESSTOKEN";

export function getTaskCredProviderPluginsDir(): string {
  let taskRootPath: string = path.dirname(path.dirname(__dirname));

  return path.join(taskRootPath, "CredentialProviderV2", "plugins");
}

export async function installCredProviderToUserProfile() {
  const taskPluginsPir = getTaskCredProviderPluginsDir();

  const userPluginsDir = getUserProfileNuGetPluginsDir();
  console.log("user plugin dir: " + userPluginsDir);
  const netCoreSource = path.join(
    taskPluginsPir,
    "netcore",
    "CredentialProvider.Microsoft"
  );

  const netCoreDest = path.join(
    userPluginsDir,
    "netcore",
    "CredentialProvider.Microsoft"
  );

  await copyCredProviderFiles(netCoreSource, netCoreDest);

  console.log();

  // Only install netfx plugin on Windows

  const isWin = process.platform === "win32";
  console.log("process actual: " + process.platform);
  console.log("process:" + isWin);
  if (isWin) {
    const netFxSource = path.join(
      taskPluginsPir,
      "netfx",
      "CredentialProvider.Microsoft"
    );
    console.log(`netfxSource: '${netFxSource}'`);
    const netFxDest = path.join(
      userPluginsDir,
      "netfx",
      "CredentialProvider.Microsoft"
    );
    console.log(`netFxDest: '${netFxDest}'`);
    await copyCredProviderFiles(netFxSource, netFxDest);

    console.log();
  }
}

async function copyCredProviderFiles(source, dest) {
  console.log(
    `Removing '${dest}' before copying from '${source}' since overwrite is enabled`
  );

  try {
    await fse.remove(dest);
  } catch (ex) {
    throw new Error(
    );
  }

  console.log(`Copying from '${source}' to '${dest}'`);

  try {
    await fse.copy(source, dest, {
      recursive: true,

      overwrite: false, // Intentional - if we're overwriting,

      errorOnExist: true // we should have removed the destination already and there shouldn't be any files
    });
  } catch (ex) {
    console.log(ex);
    throw new Error(ex.message);
  }
}

export function getUserProfileNuGetPluginsDir(): string {
  const homeDir = os.homedir();
  console.log("homedir: " + homeDir);
  return path.join(homeDir, ".nuget", "plugins");
}

export async function configureCredProvider(
  protocol: ProtocolType
) {
  const connectionData = await getConnectionDataForProtocol(protocol);

  const packagingAccessMappings = getPackagingAccessMappings(
    connectionData.locationServiceData
  );

  const accessToken = getSystemAccessToken();
  const allPrefixes: string[] = [
    ...new Set(packagingAccessMappings.map(prefix => prefix.uri))
  ];

  const publicPrefixes: string[] = [
    ...new Set(
      packagingAccessMappings
        .filter(prefix => prefix.isPublic)
        .map(prefix => prefix.uri)
    )
  ];
  publicPrefixes.forEach(publicPrefix => console.log("  " + publicPrefix));

  console.log();
  core.exportVariable(CRED_PROVIDER_PREFIX_ENVVAR, allPrefixes.join(";"));
  core.exportVariable(
    CRED_PROVIDER_ACCESS_TOKEN_ENVVAR,
    accessToken);
}
