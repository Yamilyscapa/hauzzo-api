import { Router } from 'express'
import { Multer } from 'multer'
import multerConfig from '../middleware/multer'
import path from 'path'
import { compressImageToWebp } from '../helpers/imageHelper'
import { successResponse, errorResponse } from '../helpers/responseHelper'

const router = Router()

// Uploads - Multer config
const UPLOAD_PATH = path.join(__dirname + '/../public/upload/properties')
const upload: Multer = multerConfig(UPLOAD_PATH)

router.post(
  '/images/property',
  upload.array('images', 10),
  async (req, res) => {
    try {
      const images = req.files as Express.Multer.File[]
      const { HOST, PORT } = process.env ?? ''
      const ENDPOINT = 'public/properties'
      const URL = `${HOST}:${PORT}/${ENDPOINT}`

      let imagesURLs = Promise.all(
        images.map(async (image) => {
          const res = await compressImageToWebp(image, image.destination)
          const imageURL = `${URL}/${res}`
          return imageURL
        })
      )

      successResponse(res, await imagesURLs, 'Images uploaded', 201)
    } catch (err) {
      console.error(err)
      errorResponse(res, 'Error uploading images', 400)
    }
  }
)

export default router
