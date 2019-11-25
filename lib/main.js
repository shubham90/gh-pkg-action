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
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
var request = require("request");
var fs = require("fs");
var path = require("path");
var shell = require("shelljs");
var syncRequest = require("sync-request");
var ncp = require("child_process");
const credentialProviderUtils_1 = require("./credentialProviderUtils");
const protocols_1 = require("./protocols");
var shellAssert = function () {
    var errMsg = shell.error();
    if (errMsg) {
        throw new Error(errMsg);
    }
};
var cd = function (dir) {
    var cwd = process.cwd();
    if (cwd != dir) {
        console.log("");
        console.log(`> cd ${path.relative(cwd, dir)}`);
        shell.cd(dir);
        shellAssert();
    }
};
exports.cd = cd;
var rm = function (options, target) {
    if (target) {
        shell.rm(options, target);
    }
    else {
        shell.rm(options);
    }
    shellAssert();
};
exports.rm = rm;
var test = function (options, p) {
    var result = shell.test(options, p);
    shellAssert();
    return result;
};
exports.test = test;
var mkdir = function (options, target) {
    if (target) {
        shell.mkdir(options, target);
    }
    else {
        shell.mkdir(options);
    }
    shellAssert();
};
exports.mkdir = mkdir;
var cp = function (options, source, dest) {
    if (dest) {
        shell.cp(options, source, dest);
    }
    else {
        shell.cp(options, source);
    }
    shellAssert();
};
exports.cp = cp;
var run = function (cl, inheritStreams, noHeader) {
    if (!noHeader) {
        console.log();
        console.log("> " + cl);
    }
    var options = {
        stdio: inheritStreams ? "inherit" : "pipe"
    };
    var rc = 0;
    var output;
    try {
        output = ncp.execSync(cl, options);
    }
    catch (err) {
        if (!inheritStreams) {
            console.error(err.output ? err.output.toString() : err.message);
        }
        process.exit(1);
    }
    return (output || "").toString().trim();
};
exports.run = run;
var downloadPath = path.join(__dirname, "_download");
var downloadFile = function (url) {
    // validate parameters
    if (!url) {
        throw new Error('Parameter "url" must be set.');
    }
    // skip if already downloaded
    var scrubbedUrl = url.replace(/[/\:?]/g, "_");
    var targetPath = path.join(downloadPath, "file", scrubbedUrl);
    var marker = targetPath + ".completed";
    if (!test("-f", marker)) {
        console.log("Downloading file: " + url);
        // delete any previous partial attempt
        console.log("target Path file download: " + targetPath);
        if (test("-f", targetPath)) {
            rm("-f", targetPath);
        }
        // download the file
        mkdir('-p', path.join(downloadPath, 'file'));
        var result = syncRequest('GET', url);
        fs.writeFileSync(targetPath, result.getBody());
        // write the completed marker
        fs.writeFileSync(marker, "");
    }
    return targetPath;
};
exports.downloadFile = downloadFile;
var downloadArchive = function (url, omitExtensionCheck) {
    // validate parameters
    if (!url) {
        throw new Error('Parameter "url" must be set.');
    }
    var isZip;
    var isTargz;
    if (omitExtensionCheck) {
        isZip = true;
    }
    else {
        if (url.match(/\.zip$/)) {
            isZip = true;
        }
        else if (url.match(/\.tar\.gz$/) &&
            (process.platform == "darwin" || process.platform == "linux")) {
            isTargz = true;
        }
        else {
            throw new Error("Unexpected archive extension");
        }
    }
    // skip if already downloaded and extracted
    var scrubbedUrl = url.replace(/[/\:?]/g, "_");
    var targetPath = path.join(downloadPath, "archive", scrubbedUrl);
    var marker = targetPath + ".completed";
    if (!test("-f", marker)) {
        // download the archive
        var archivePath = downloadFile(url);
        console.log("Extracting archive: " + url);
        // delete any previously attempted extraction directory
        if (test("-d", targetPath)) {
            rm("-rf", targetPath);
        }
        // extract
        mkdir("-p", targetPath);
        if (isZip) {
            if (process.platform == "win32") {
                let escapedFile = archivePath
                    .replace(/'/g, "''")
                    .replace(/"|\n|\r/g, ""); // double-up single quotes, remove double quotes and newlines
                let escapedDest = targetPath
                    .replace(/'/g, "''")
                    .replace(/"|\n|\r/g, "");
                let command = `$ErrorActionPreference = 'Stop' ; try { Add-Type -AssemblyName System.IO.Compression.FileSystem } catch { } ; [System.IO.Compression.ZipFile]::ExtractToDirectory('${escapedFile}', '${escapedDest}')`;
                run(`powershell -Command "${command}"`, false, false);
            }
            else {
                run(`unzip ${archivePath} -d ${targetPath}`, false, false);
            }
        }
        else if (isTargz) {
            var originalCwd = process.cwd();
            cd(targetPath);
            try {
                run(`tar -xzf "${archivePath}"`, false, false);
            }
            finally {
                cd(originalCwd);
            }
        }
        // write the completed marker
        fs.writeFileSync(marker, "");
    }
    return targetPath;
};
exports.downloadArchive = downloadArchive;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // download and extract the archive package
            var archiveSource = downloadArchive("https://vstsagenttools.blob.core.windows.net/tools/NuGetCredProvider/0.1.20/c.zip", true);
            // copy the files
            var taskRootPath = path.dirname(path.dirname(__dirname));
            var archiveDest = path.join(taskRootPath, "./CredentialProviderV2/");
            mkdir("-p", archiveDest);
            cp("-R", path.join(archiveSource, "*"), archiveDest);
            console.log(`Hello NuGet!`);
            yield credentialProviderUtils_1.installCredProviderToUserProfile(true);
            yield credentialProviderUtils_1.configureCredProvider(protocols_1.ProtocolType.NuGet);
            // Get the JSON webhook payload for the event that triggered the workflow
            const payload = JSON.stringify(github.context.payload, undefined, 2);
            console.log(`The event payload: ${payload}`);
        }
        catch (error) {
            console.log(error);
            core.setFailed(error.message);
        }
    });
}
main();
