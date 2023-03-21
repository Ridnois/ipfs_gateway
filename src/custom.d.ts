declare global {
  namespace Express {
    export interface Response {
      ipfsClient?: IPFSHTTPClient;
    }
  }
}

