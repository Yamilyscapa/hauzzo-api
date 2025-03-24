import multer = require('multer')

export default (uploadPath: string): multer.Multer => {
  const multerConfig: multer.Multer = multer({
    dest: uploadPath,
    // Validate file type
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Only image files are allowed'))
      }
      cb(null, true)
    },
    // Save file
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadPath)
      },
      // Rename file and keep extension
      filename: (req, file, cb) => {
        const extname = file.originalname.split('.').pop()
        cb(null, Date.now().toString() + '.' + extname)
      },
    }),
  })

  return multerConfig
}
