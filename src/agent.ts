import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  LogDescription,
} from "forta-agent";
import { TRANSFER_EVENT_1155, TRANSFER_EVENT_721 } from "./constants";
import axios from "axios";
import {
  getNftUri,
  parseSvgDataUri,
  getFullIpfsUri,
  urlIsSvg,
} from "./utils";

const handleTransaction: HandleTransaction = async (txEvent: TransactionEvent) => {
  const findings: Finding[] = [];

  await processERC1155Logs(txEvent, findings);
  await processERC721Logs(txEvent, findings);

  return findings;
};

async function processERC1155Logs(
  txEvent: TransactionEvent,
  findings: Finding[]
) {
  const logs: LogDescription[] = txEvent.filterLog([TRANSFER_EVENT_1155]);

  await Promise.all(logs.map(async (log) => {
    const from = log.args.from;
    const to = log.args.to;
    const tokenId = log.args.id;
    const emitter = log.address;

    let uri: string | undefined;
    try {
      uri = await getNftUri(emitter, tokenId);
      console.log(`Minted NFT - 1155 Transfer Details:
        From: ${from}
        To: ${to}
        Token ID: ${tokenId}
        Uri: ${uri}
        Emitter: ${emitter}
      `);
      if (await urlIsSvg(uri)) {
        console.log(`NFT 1155 SVG Image url is '${uri}'`);
      }
      if (uri && uri.includes("ipfs:")) {
        await processIpfsURI(uri);
      }
    } catch (error) {
      // console.error('Error retrieving NFT 1155 URI:', error);
    }
  }));
}

async function processERC721Logs(
  txEvent: TransactionEvent,
  findings: Finding[]
) {
  const logs: LogDescription[] = txEvent.filterLog([TRANSFER_EVENT_721]);

  await Promise.all(logs.map(async (log) => {
    const emitter = log.args.emitter || log.address;
    const from = log.args.from;
    const to = log.args.to;
    const tokenId = log.args.tokenId;
    let uri: string | undefined;

    try {
      uri = await getNftUri(emitter, tokenId);

      if (await urlIsSvg(uri)) {
        console.log(`SVG Image url is '${uri}'`);
      }

      if (uri && uri.includes("ipfs:")) {
        await processIpfsURI(uri);
      }
    } catch (error) {
      // console.error('Error retrieving NFT 721 URI:', error);
    }
  }));
}

async function processIpfsURI(uri: string) {
  console.log(`IPFS link detected: ${uri}`);
  const uriInFull = await getFullIpfsUri(uri);
  console.log(`Full ipfs link: ${uriInFull}`);
  const { data } = await axios(`${uriInFull}`);
  const ipfsImg = data.image;
  const imageUri = await getFullIpfsUri(ipfsImg);
  console.log(`IPFS Image url is '${imageUri}'`);
  if (await urlIsSvg(imageUri)) {
    console.log(`SVG Image url is '${imageUri}'`);
  }
}

export default {
  handleTransaction,
};