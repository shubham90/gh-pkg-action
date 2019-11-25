export enum ProtocolType {
  NuGet
}

export function getAreaIdForProtocol(protocolType: ProtocolType): string {
  switch (protocolType) {
    default:

    case ProtocolType.NuGet:
      return "B3BE7473-68EA-4A81-BFC7-9530BAAA19AD";
  }
}
