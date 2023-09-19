import { utils } from 'ethers';
import { Erc1155Abi, Erc721Abi } from 'forta-helpers/dist/token';

export const erc721Iface = new utils.Interface(Erc721Abi);
export const erc1155Iface = new utils.Interface(Erc1155Abi);

export const TRANSFER_EVENT_721 = "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
export const TRANSFER_EVENT_1155 = "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)"
export const IPFS_ENDPOINT = 'https://cloudflare-ipfs.com/ipfs';
  