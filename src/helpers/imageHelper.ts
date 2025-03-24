import sharp from "sharp";
import fs from "fs";

interface Image {
    fieldname: string,
    originalname: string,
    encoding: string,
    mimetype: string,
    destination: string,
    filename: string,
    path: string,
    size: number
}

function removeExtension(filename: string): string {
    return filename.replace(/\.[^/.]+$/, "")
}

async function deleteUncompressedImage(path: string): Promise<void> {
    fs.rm(path, err => {
        if (err) {
            console.error(err)
        }
    })
}

export async function compressImageToWebp(image: Image, destination: string): Promise<string> {
    const { path, filename } = image

    destination = `${removeExtension(path)}_c.webp`

    sharp(path)
        .webp({ quality: 80 })
        .toFile(destination)
        .then(() => {
            deleteUncompressedImage(path)
        }
        )
        .catch(err => {
            console.error(err)
        }
        )

        return `${removeExtension(filename)}_c.webp`
}