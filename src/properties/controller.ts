import { pool } from '../database/client'
import { Property } from '@shared/global'
import { getBrokerById } from '../brokers/controller'
import { validate } from 'uuid'
import ImageKit from 'imagekit'

interface stdRes {
  data: any
  error: any
}

/**
 * Handles the upload of multiple images to ImageKit
 * Optimizes images for property slideshow display:
 * - Width: 1200px (good for most displays)
 * - Format: WebP (better compression, modern format)
 * - Quality: 80% (good balance between quality and size)
 * @param images - Array of files from multer
 * @returns Promise with uploaded image URLs or error
 */
export async function handleImagesUpload(
  images: Express.Multer.File[]
): Promise<stdRes> {
  let response: stdRes = {
    data: null,
    error: null,
  }

  // Input validation
  if (!images || images.length === 0) {
    response.error = 'No images provided for upload'
    return response
  }

  // Get and validate ImageKit credentials
  const publicKey = process.env.IMAGEKIT_API_PUBLIC_KEY
  const privateKey = process.env.IMAGEKIT_API_KEY
  const urlEndpoint = process.env.IMAGEKIT_ENDPOINT_URL

  if (!publicKey || !privateKey || !urlEndpoint) {
    response.error =
      'ImageKit configuration is missing. Please check environment variables.'
    return response
  }

  // Initialize ImageKit with credentials
  const ImgKit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  })

  try {
    const imageUrls: string[] = []

    // Process each image sequentially to prevent memory issues
    for (const image of images) {
      try {
        // Validate buffer data
        if (!image.buffer || image.buffer.length === 0) {
          throw new Error('Invalid buffer data')
        }

        // Convert image buffer to base64 for upload
        const base64Image = Buffer.from(image.buffer).toString('base64')

        // Upload to ImageKit with optimized settings
        const result = await ImgKit.upload({
          file: base64Image,
          fileName: `${Date.now()}-${image.originalname.replace(/\.[^/.]+$/, '')}.webp`,
          folder: '/properties',
          useUniqueFileName: true,
          responseFields: ['url', 'fileId', 'name'],
          extensions: [
            {
              name: 'google-auto-tagging',
              maxTags: 5,
              minConfidence: 95,
            },
          ],
        })

        // Validate upload result
        if (!result || !result.url) {
          throw new Error('Upload failed - no URL returned')
        }

        // Construct CDN URL with optimizations for slideshow display
        // - w-1200: resize width to 1200px (height auto-adjusts)
        // - f-webp: convert to WebP format
        // - q-80: 80% quality
        // - ar-16-9: maintain 16:9 aspect ratio
        // - c-at_max: contain mode to prevent cropping
        const fullUrl = `${urlEndpoint}/properties/${result.name}?tr=w-1200,f-webp,q-80,ar-16-9,c-at_max`
        imageUrls.push(fullUrl)
      } catch (err) {
        console.error(`Failed to upload image ${image.originalname}:`, err)
        throw err
      }
    }

    response.data = imageUrls
    return response
  } catch (error: any) {
    console.error('Error in handleImagesUpload:', error)
    response.error = `Failed to upload images: ${error.message || 'Unknown error'}`
    return response
  }
}

// export async function handleImagesUpload(
//   images: Express.Multer.File[]
// ): Promise<stdRes> {
//   let response: stdRes = {
//     data: null,
//     error: null,
//   }

//   try {
//     const body = new FormData()

//     // Append each image to the body
//     images.forEach((image) => {
//       body.append(image.fieldname, image.buffer, {
//         filename: image.originalname,
//         contentType: image.mimetype,
//       })
//     })

//     const { HOST, PORT } = process.env ?? ''
//     const ENDPOINT = 'upload/images/property'
//     const URL = `${HOST}:${PORT}/${ENDPOINT}`

//     const res = await axios.post(URL, body, {
//       headers: {
//         ...body.getHeaders(),
//       },
//     })

//     response.data = res.data.data
//     return response
//   } catch (error) {
//     response.error = error
//     return response
//   }
// }

// GET
export async function findManyProperties(limit?: number): Promise<stdRes> {
  let response: stdRes = {
    data: null,
    error: null,
  }

  try {
    let query = 'SELECT * FROM properties'
    if (limit) query += ` LIMIT ${limit}`

    const { rows: properties } = await pool.query(query)
    response.data = properties

    if (properties.length === 0) {
      response.error = 'No properties found'
    }

    return response
  } catch (error) {
    response.error = error
    return response
  }
}

export async function findOneProperty(id: string): Promise<stdRes> {
  let response: stdRes = {
    data: null,
    error: null,
  }

  try {
    const { rows: data } = await pool.query(
      'SELECT * FROM properties WHERE id = $1',
      [id]
    )
    response.data = data[0]

    return response
  } catch (error) {
    response.error = error
    return response
  }
}

// POST
export async function createProperty(
  property: Property,
  brokerId: string
): Promise<stdRes> {
  let response: stdRes = {
    data: null,
    error: null,
  }

  try {
    let {
      title,
      description,
      price,
      tags,
      bedrooms,
      bathrooms,
      parking,
      type,
      location,
      transaction,
    } = property
    const requiredFields = [
      'title',
      'description',
      'price',
      'tags',
      'bedrooms',
      'bathrooms',
      'parking',
      'type',
      'transaction',
    ]

    // Validate that all of the data is present except location
    for (const key of requiredFields) {
      if (!property[key as keyof typeof property]) {
        response.error = `Missing ${key} data`
        return response
      }
    }

    // Validate that address is present in location
    for (const key in location) {
      if (!location[key as keyof typeof location]) {
        response.error = 'Missing location data'
        return response
      }
    }

    // Validate that the location data is complete
    const locationRequiredFields = ['address', 'city', 'state', 'zip']
    const locationJson = JSON.parse(location as any)

    const includesAll = locationRequiredFields.every((field) =>
      Object.keys(locationJson).includes(field)
    )

    if (!includesAll) {
      response.error = 'Missing location data (address, city, state, zip)'
      return response
    }

    // Validate that the broker exists
    if (!brokerId) {
      response.error = 'Missing broker ID'
      return response
    }

    const { broker, error } = await getBrokerById(brokerId)

    if (!broker) {
      response.error = 'Broker not found'
      return response
    } else if (error) {
      response.error = error
      return response
    }

    // Insert into database
    const { rows } = await pool.query(
      `INSERT INTO properties 
        (title, description, price, tags, bedrooms, bathrooms, parking, location, type, broker_id, transaction) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *`,
      [
        title,
        description,
        price,
        tags,
        bedrooms,
        bathrooms,
        parking,
        JSON.stringify(location), // Stringify to store as JSON in Postgres
        type,
        brokerId,
        transaction,
      ]
    )

    if (!rows[0]) {
      response.error = 'Error creating data'
      return response
    }

    response.data = rows[0]
    return response
  } catch (error) {
    response.error = error
    return response
  }
}

// EDIT
export async function editProperty(
  id: string,
  { title, description, tags, price, location }: Property
): Promise<stdRes> {
  let response: stdRes = {
    data: null,
    error: null,
  }

  if (!validate(id)) {
    response.error = 'Invalid data ID'
    return response
  }

  const { data: property, error } = await findOneProperty(id)
  const data = property as Property

  if (error) {
    response.error = error
    return response
  } else if (!data) {
    response.error = 'data not found'
    return response
  }

  try {
    // Convert to key - values to make dynacmic the query
    const currentdata = {
      title: title,
      description: description,
      tags: tags,
      price: price,
      location: location,
    }

    const currentLocation: Property['location'] = {
      address: data.location.address,
      addressNumber: data.location.addressNumber,
      street: data.location.street,
      neighborhood: data.location.neighborhood,
      city: data.location.city,
      state: data.location.state,
      zip: data.location.zip,
    }

    const queryValues: (string | null)[] = Object.entries(currentdata).map(
      ([key, value]) => {
        // Validate value is not empty
        if (value === ' ') {
          response.error = `Value for ${key} cannot be empty`
          return null
        }

        if (!value) return null

        // Convert tags to PostgreSQL array string format
        if (key === 'tags') {
          if (Array.isArray(value)) {
            value = '{' + value.join(',') + '}'
          } else if (typeof value === 'string') {
            value = '{' + value + '}'
          }
        }

        // Merge location data without overwriting the rest of the location data
        if (key === 'location') {
          if (!Array.isArray(data)) {
            function getCommonKeys(
              obj1: Record<string, any>,
              obj2: Record<string, any>
            ): Record<string, any> {
              return Object.keys(obj1)
                .filter((key) => key in obj2)
                .reduce(
                  (acc, key) => {
                    acc[key] = obj1[key]
                    return acc
                  },
                  {} as Record<string, any>
                )
            }

            const newLocation = getCommonKeys(
              currentLocation,
              value as Property['location']
            )

            if (Object.keys(data.location).length === 0) return null
            value = JSON.stringify({ ...data.location, ...newLocation })
          }
        }

        return `${key} = '${value}'`
      }
    )

    const queryValuesNotNull = queryValues.filter((value) => value !== null)

    // If no values to update, return error
    if (queryValuesNotNull.length === 0) {
      response.error = 'No values to update'
      return response
    }

    const query = {
      text: `UPDATE properties SET ${queryValuesNotNull.join(', ')} WHERE id = $1 RETURNING *`,
      values: [id],
    }

    const { rows } = await pool.query(query)

    response.data = rows[0]
    return response
  } catch (error) {
    response.error = error
    return response
  }
}

export async function updatePropertyImages(id: string, images: string[]) {
  const response: stdRes = {
    data: null,
    error: null,
  }

  if (!validate(id)) {
    response.error = 'Invalid data ID'
    return response
  }

  if (!images || images.length === 0) {
    response.error = 'No images to update'
    return response
  }

  try {
    const query = {
      text: `UPDATE properties SET images = $1 WHERE id = $2 RETURNING *`,
      values: [images, id],
    }
    const { rows } = await pool.query(query)

    if (!rows[0]) {
      response.error = 'Error updating data'
      return response
    }

    response.data = rows[0]
    return response
  } catch (error) {
    response.error = error
    return response
  }
}

// DELETE
export async function deletedata(id: string) {
  const response: stdRes = {
    data: null,
    error: null,
  }

  if (!validate(id)) {
    response.error = 'Invalid data ID'
    return response
  }

  try {
    const query = {
      text: 'DELETE FROM properties WHERE id = $1 RETURNING *',
      values: [id],
    }
    const { rows } = await pool.query(query)

    if (!rows[0]) {
      response.error = 'Property not found or already deleted'
      return response
    }

    response.data = rows[0]
    return response
  } catch (error) {
    response.error = error
    return response
  }
}
