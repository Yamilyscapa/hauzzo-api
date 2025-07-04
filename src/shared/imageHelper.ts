import sharp from 'sharp'
import fs from 'fs'
import { resolve } from 'path'

interface Image {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  destination: string
  filename: string
  path: string
  size: number
}

function removeExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '')
}

async function deleteUncompressedImage(path: string): Promise<void> {
  try {
    path = resolve(path)
    await fs.promises.unlink(path)
  } catch (err) {
    console.error(err)
  }
}

export async function compressImageToWebp(
  image: Image,
  destination: string
): Promise<string> {
  const { path, filename } = image

  destination = `${removeExtension(path)}_c.webp`

  sharp(path)
    .webp({ quality: 70 })
    .toFile(destination)
    .then(() => {
      deleteUncompressedImage(path)
    })
    .catch((err) => {
      console.error(err)
    })

  return `${removeExtension(filename)}_c.webp`
}
