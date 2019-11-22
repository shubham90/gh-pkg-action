"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ProtocolType;
(function (ProtocolType) {
    ProtocolType[ProtocolType["NuGet"] = 0] = "NuGet";
    ProtocolType[ProtocolType["Maven"] = 1] = "Maven";
    ProtocolType[ProtocolType["Npm"] = 2] = "Npm";
    ProtocolType[ProtocolType["PyPi"] = 3] = "PyPi";
})(ProtocolType = exports.ProtocolType || (exports.ProtocolType = {}));
function getAreaIdForProtocol(protocolType) {
    switch (protocolType) {
        case ProtocolType.Maven:
            return "6F7F8C07-FF36-473C-BCF3-BD6CC9B6C066";
        case ProtocolType.Npm:
            return "4C83CFC1-F33A-477E-A789-29D38FFCA52E";
        case ProtocolType.PyPi:
            return "92F0314B-06C5-46E0-ABE7-15FD9D13276A";
        default:
        case ProtocolType.NuGet:
            return "B3BE7473-68EA-4A81-BFC7-9530BAAA19AD";
    }
}
exports.getAreaIdForProtocol = getAreaIdForProtocol;
