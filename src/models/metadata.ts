import mongoose, { Model, Schema } from 'mongoose'

interface Metadata {
  cid: string;
  metadata: any
}

const metadataSchema = new Schema({
  _id: {
    type: 'string',
    required: true,
  },
  metadata: {
    type: Object
  }
})

const MetadataModel: Model<Metadata> = mongoose.model<Metadata>('metadata', metadataSchema)

export default MetadataModel
