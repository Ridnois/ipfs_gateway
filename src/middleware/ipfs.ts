import { Request, Response, NextFunction } from "express";
import { create } from "ipfs-http-client";
import { config } from "dotenv";

config()

async function IPFSClient() {
  const projectId = process.env.IPFS_PROJECT_ID
  const secretKey = process.env.IPFS_SECRET_KEY

  const auth =
    'Basic ' + Buffer.from(projectId + ':' + secretKey).toString('base64');

  const _ipfs = create({
    host: process.env.IPFS_URI,
    port: parseInt(process.env.IPFS_PORT as string),
    protocol: 'https',
    headers: {
      authorization: auth
    }
  })
  //const _ipfs = create()

  return _ipfs
}

export default async function withIPFS(req: Request, res: Response, next: NextFunction) {
  const ipfsClient = await IPFSClient()
  res.ipfsClient = ipfsClient
  next()
}
