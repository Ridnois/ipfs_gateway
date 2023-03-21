import mongoose, { Model, Schema } from "mongoose";

interface IIPFSFile {
  fileName: string;
  mimetype: string;
  cid: string;
  _id: string;
}

const IPFSSchema = new Schema({
  _id: {
    type: 'string',
    required: true,
  },
  fileName: {
    type: 'string',
    required: 'true',
  },
  mimetype: {
    type: 'string',
    required: true,
    default: 'image/jpeg',
  },
  cid: {
    type: 'string',
    required: true,
  },
  path: {
    type: 'string',
    required: 'false'
  }
})

const IPFSModel: Model<IIPFSFile> = mongoose.model<IIPFSFile>('IPFSFile', IPFSSchema)

export default IPFSModel

