const core = require("@actions/core");
const github = require("@actions/github");
import { installCredProviderToUserProfile, configureCredProvider } from './credentialProviderUtils'
import { ProtocolType } from './protocols';
async function main() {
try {
    console.log(`Hello NuGet!`);
    await installCredProviderToUserProfile(true);
    await configureCredProvider(ProtocolType.NuGet);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
} 

main();