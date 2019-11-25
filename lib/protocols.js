"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ProtocolType;
(function (ProtocolType) {
    ProtocolType[ProtocolType["NuGet"] = 0] = "NuGet";
})(ProtocolType = exports.ProtocolType || (exports.ProtocolType = {}));
function getAreaIdForProtocol(protocolType) {
    switch (protocolType) {
        default:
        case ProtocolType.NuGet:
            return "B3BE7473-68EA-4A81-BFC7-9530BAAA19AD";
    }
}
exports.getAreaIdForProtocol = getAreaIdForProtocol;
