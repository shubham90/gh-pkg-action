const core = require("@actions/core");
var fs = require("fs");
var path = require("path");
var shell = require("shelljs");
var syncRequest = require("sync-request");
var ncp = require("child_process");

import {
  installCredProviderToUserProfile,
  configureCredProvider
} from "./credentialProviderUtils";
import { ProtocolType } from "./protocols";

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
  } else {
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
  } else {
    shell.mkdir(options);
  }
  shellAssert();
};

exports.mkdir = mkdir;

var cp = function (options, source, dest) {
  if (dest) {
    shell.cp(options, source, dest);
  } else {
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
  } catch (err) {
    if (!inheritStreams) {
      console.error(err.output ? err.output.toString() : err.message);
    }

    process.exit(1);
  }

  return (output || "").toString().trim();
};

exports.run = run;

var downloadPath = path.join(__dirname, "_download");
function wait(ms) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}
var downloadFile = function (url) {
  // validate parameters

  if (!url) {
    throw new Error('Parameter "url" must be set.');
  }

  var scrubbedUrl = url.replace(/[/\:?]/g, "_");

  var targetPath = path.join(downloadPath, "file", scrubbedUrl);
  var marker = targetPath + ".completed";

  // delete any previous partial attempt
  if (test("-f", targetPath)) {
    rm("-f", targetPath);
  }

  // download the file

  mkdir('-p', path.join(downloadPath, 'file'));

  console.log("Download begin for : " + url);
  var result = syncRequest('GET', url);

  fs.writeFileSync(targetPath, result.getBody());

  fs.writeFileSync(marker, '');

  return targetPath;
};

exports.downloadFile = downloadFile;

var downloadArchive = function (url) {
  // validate parameters

  if (!url) {
    throw new Error('Parameter "url" must be set.');
  }
  // skip if already downloaded and extracted

  var scrubbedUrl = url.replace(/[/\:?]/g, "_");

  var targetPath = path.join(downloadPath, "archive", scrubbedUrl);

  var marker = targetPath + ".completed";

  if (!test("-f", marker)) {
    // download the archive

    var archivePath = downloadFile(url);
    console.log("Extracting archive: " + archivePath);

    // delete any previously attempted extraction directory

    if (test("-d", targetPath)) {
      rm("-rf", targetPath);
    }

    // extract

    mkdir("-p", targetPath);

    if (process.platform == "win32" && archivePath != null) {
      let escapedFile = archivePath
        .replace(/'/g, "''")
        .replace(/"|\n|\r/g, ""); // double-up single quotes, remove double quotes and newlines

      let escapedDest = targetPath
        .replace(/'/g, "''")
        .replace(/"|\n|\r/g, "");

      let command = `$ErrorActionPreference = 'Stop' ; try { Add-Type -AssemblyName System.IO.Compression.FileSystem } catch { } ; [System.IO.Compression.ZipFile]::ExtractToDirectory('${escapedFile}', '${escapedDest}')`;

      run(`powershell -Command "${command}"`, false, false);
    } else {
      run(`unzip ${archivePath} -d ${targetPath}`, false, false);
    }

    // write the completed marker

    fs.writeFileSync(marker, "");
  }

  return targetPath;
};

exports.downloadArchive = downloadArchive;

async function main() {
  try {
    // download and extract the archive package
    var archiveSource = downloadArchive(
      "https://vstsagenttools.blob.core.windows.net/tools/NuGetCredProvider/0.1.20/c.zip"
    );
    // copy the files
    var taskRootPath: string = path.dirname(path.dirname(__dirname));
    var archiveDest = path.join(
      taskRootPath,
      "./CredentialProviderV2/"
    );
    mkdir("-p", archiveDest);
    cp("-R", path.join(archiveSource, "*"), archiveDest);

    console.log(`Hello NuGet!`);
    await installCredProviderToUserProfile();
    await configureCredProvider(ProtocolType.NuGet);
  } catch (error) {
    console.log(error);
    core.setFailed(error.message);
  }
}

main();
