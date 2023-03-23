import path from 'path'
import fs from 'fs'
import { Router } from 'express'
import withIPFS from '../middleware/ipfs'
import IPFSModel from '../models/ipfs'
import { IPFSHTTPClient } from 'ipfs-http-client/types/src/types'
import upload from '../middleware/multer'
import { TIME_TO_LIVE } from '../constants/cache'

declare global {
  namespace Express {
    export interface Response {
      ipfsClient?: IPFSHTTPClient;
    }
  }
}

const router = Router()

// Get all
router.get('/images', async (_, res) => {
  try {
    const images = await IPFSModel.find()
    res.json(images)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Get from cid
router.get('/:cid', withIPFS, async (req, res) => {
  try {
    const cachePath = path.join(__dirname, '..', 'cache', req.params.cid)

    if (fs.existsSync(cachePath)) {
      const stream = fs.createReadStream(cachePath)

      res.setHeader('Content-Type', 'image/jpeg')
      res.setHeader('Content-Disposition', `attachment: filename=${req.params.cid}`)
      stream.pipe(res)
      return
    }

    const result = res.ipfsClient?.cat(req.params.cid)

    const chunks: Uint8Array[] = []
    for await (const chunk of result as any) {
      chunks.push(chunk)
    }

    const data = Buffer.concat(chunks)

    fs.writeFile(cachePath, data, (err) => {
      if (err) {
        console.log('Error caching file')
        console.log(err)
      } else {
        console.log('File cached successfully')
      }
    })

    res.setHeader('Content-Type', 'image/jpeg')
    res.setHeader('Content-Disposition', `attachment: filename=${req.params.cid}`)
    res.send(data)

    setTimeout(() => {
      fs.unlink(cachePath, (err) => {
        if (err) {
          console.log('Error deleting cache file')
        } else {
          console.log('Cache deleted successfully')
        }
      })
    }, parseInt(TIME_TO_LIVE as string))
  } catch (e: any) {
    res.status(500).json({ error: e.error })
  }
})

// Get a image
router.get('/image/:fileName', withIPFS, async (req, res) => {
  const { fileName } = req.params
  // Get stored data on the DB
  const fileData = await IPFSModel.findOne({ fileName })

  // Return 404 if data not found
  if (!fileData) {
    res.status(404).json({ error: `Could not find ${fileName}, if you know file's cid with  GET /ipfs/:cid` })
    return
  }

  const { cid, mimetype } = fileData

  // Extact the buffer from IPFS
  const result = res.ipfsClient?.cat(cid)
  const chunks: Uint8Array[] = []

  // push the chunks
  for await (const chunk of result as any) {
    chunks.push(chunk)
  }

  const data = Buffer.concat(chunks)

  res.setHeader('Content-Type', mimetype)
  res.setHeader('Content-Disposition', `attachment: filename=${fileName}`)
  res.send(data)
})

// Save a image
router.post('/image', upload.single('image'), withIPFS, async (req, res) => {
  try {
    // Extract metadata from file
    const { file } = req

    if (!file) {
      res.status(400).json({ error: 'Must upload an image' })
      return
    }

    // Extract data from the file
    const { mimetype, originalname: fileName, buffer } = file

    // Get the cid from the addition of the buffer
    const client = res.ipfsClient
    const { cid, path } = await client?.add({
      path: fileName,
      content: buffer
    }) as any

    // Store metadata on DB
    const newIPFSFile = new IPFSModel({
      _id: cid.toString(),
      cid: cid.toString(),
      mimetype,
      fileName,
      path
    })

    await newIPFSFile.save()

    res.json(newIPFSFile)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Delete an image
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params
    if (!cid) {
      res.status(400).json({ error: 'must provide a valid cid' })
    }
    const deleteResponse = await IPFSModel.deleteOne({ cid: cid })
    console.log(deleteResponse)
    res.json({ deleteResponse })
  } catch (e: any) {
    res.status(400).json({ error: e.error })
  }
})

export default router
