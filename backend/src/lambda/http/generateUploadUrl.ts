import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { generateSignedUrl } from '../../s3/generateSignedUrl'
import { createLogger } from '../../utils/logger'
import { uploadTodoAttachment } from '../../businessLogic/todo'

const logger = createLogger('Image upload')
const bucketName = process.env.IMAGES_S3_BUCKET

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event ${event}`)

    const { todoId } = event.pathParameters
    const signedUrl = generateSignedUrl(todoId)
    const authHeader = event.headers.Authorization
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

    await uploadTodoAttachment(todoId, authHeader, attachmentUrl)


    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: signedUrl
      })
    }
  }
).use(cors())