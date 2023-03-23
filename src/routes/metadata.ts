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

// Get one from cid
router.get('/:cid', withIPFS, async (req, res) => {
  try {
    const { cid } = req.params
    // Check if it exists on database
    const fromDB = await Metadata.findById(cid)

    // If not, get it from IPFS and store it on database
    if (!fromDB) {

      const result = res.ipfsClient?.cat(cid)

      const chunks: Uint8Array[] = []

      for await (const chunk of result as any) {
        chunks.push(chunk)
      }

      const data = Buffer.concat(chunks)

      const newData = new Metadata({ _id: cid, metadata: JSON.parse(data.toString()) })

      await newData.save()

      res.json(newData)
      return
    }

    const metadata = await Metadata.findById(cid)

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

// Delete using CID
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params

    const result = await Metadata.deleteOne({ _id: cid })

    res.send(result)
  } catch (e: any) {
    res.json({ error: e.message })
  }
})

export default router
