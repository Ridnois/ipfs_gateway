import { Router } from 'express'
import Metadata from '../models/metadata'

import withIPFS from '../middleware/ipfs'

const router = Router()

// Get all metadata stored
router.get('/', async (_, res) => {
  try {
    const data = await Metadata.find()
    res.json(data)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Create one
router.post('/', withIPFS, async (req, res) => {
  try {
    const { data } = req.body
    console.log(data)
    const client = res.ipfsClient
    const { cid } = await client?.add(JSON.stringify(data)) as any
    if (cid) {
      const newMetadata = new Metadata({ _id: cid.toString(), metadata: data })
      await newMetadata.save()
      res.json({ cid: cid.toString() })
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Get one
router.get('/:cid/:file', withIPFS, async (req, res) => {
  try {
    const { cid, file } = req.params
    const path = `${cid}${file ? `/${file}` : ''}`
    // Check if it exists on database
    const fromDB = await Metadata.findById(path)

    // If not, get it from IPFS and store it on database
    if (!fromDB) {

      const result = res.ipfsClient?.cat(path)

      const chunks: Uint8Array[] = []

      for await (const chunk of result as any) {
        chunks.push(chunk)
      }

      const data = Buffer.concat(chunks)

      const newData = new Metadata({ _id: path, metadata: JSON.parse(data.toString()) })

      await newData.save()

      res.json(newData)
      return
    }
    const metadata = await Metadata.findById(path)

    res.json(metadata?.metadata)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Delete one
router.delete('/:cid/:file', async (req, res) => {
  try {
    const { cid, file } = req.params
    const path = `${cid}${file ? `/${file}` : ''}`

    const result = await Metadata.deleteOne({ _id: path })

    res.send(result)
  } catch (e: any) {
    res.json({ error: e.message })
  }
})

export default router
