import { LogDescription, ethers, getEthersProvider } from "forta-agent";
import { containsLink, isCid } from "forta-helpers/dist/ipfs";
import { erc721Iface, erc1155Iface } from "forta-helpers";


export async function getNftUri(tokenAddress: string, tokenId: string): Promise<string> {
  const provider = getEthersProvider();
  const contract = new ethers.Contract(tokenAddress, erc721Iface, provider);

  const isERC721 = await contract.supportsInterface("0x80ac58cd"); // ERC721 interface ID
  let uri: string;

  if (isERC721) {
    uri = await contract.tokenURI(tokenId);
  } else {
    const contract1155 = new ethers.Contract(tokenAddress, erc1155Iface, provider);
    uri = await contract1155.uri(tokenId);
  }

  return uri;
}

export async function urlIsSvg(url: string) {
  const r = await fetch(url, {method: 'HEAD'});
  return r.headers.get('content-type') === 'image/svg+xml';
}
export function getFullIpfsUri(uri: string) {
  const gatewayUrl = 'https://ipfs.io/ipfs/';

  if (uri.indexOf('ipfs://') === 0) {
    return uri.replace('ipfs://', gatewayUrl);
  } else if (uri.indexOf('://') === 0) {
    return uri.replace('://', gatewayUrl);
  } else if (uri.indexOf('://ipfs/')) {
    return uri.replace('://ipfs/', gatewayUrl);
  } else if (uri.indexOf('/ipfs/') === 0) {
    return uri.replace('/ipfs/', gatewayUrl);
  } else if (isCid(uri)) {
    return gatewayUrl + uri;
  } else if (containsLink(uri)) {
    return uri;
  }

  return uri;
}
export function parseSvgDataUri(dataUri: string): object | null {
  const prefix = 'data:image/svg+xml;base64,';
  const encodedData = dataUri.substring(prefix.length);

  try {
    const decodedData = Buffer.from(encodedData, 'base64').toString();
    return JSON.parse(decodedData);
  } catch (e) {
    return null;
  }
}
