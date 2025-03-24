import fs from 'fs'
import path from 'path'

export function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`Created directory: ${dirPath}`)
  }
}

export function checkAndCreateDirectories() {
  const baseDir = path.join(__dirname, '..', 'public')
  const uploadDir = path.join(baseDir, 'upload')
  const directories = ['properties', 'users']

  // Ensure 'public' and 'public/upload' exist
  ensureDirectoryExists(baseDir)
  ensureDirectoryExists(uploadDir)

  // Ensure 'public/upload/properties' and 'public/upload/users' exist
  directories.forEach((dir) => {
    ensureDirectoryExists(path.join(uploadDir, dir))
  })

  console.log('All static directories are set up')
}

export default function init() {
  checkAndCreateDirectories()
}
