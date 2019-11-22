"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
const credentialProviderUtils_1 = require("./credentialProviderUtils");
const protocols_1 = require("./protocols");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Hello NuGet!`);
            yield credentialProviderUtils_1.installCredProviderToUserProfile(true);
            yield credentialProviderUtils_1.configureCredProvider(protocols_1.ProtocolType.NuGet);
            // Get the JSON webhook payload for the event that triggered the workflow
            const payload = JSON.stringify(github.context.payload, undefined, 2);
            console.log(`The event payload: ${payload}`);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
main();
