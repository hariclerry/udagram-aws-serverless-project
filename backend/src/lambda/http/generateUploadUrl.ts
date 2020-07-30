import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import * as AWS from 'aws-sdk'

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = 60 * 5

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
     const url = getUploadUrl(todoId)

     return {
       statusCode: 201,
       headers: {
         'Access-Control-Allow-Origin': '*'
       },
       body: JSON.stringify({
         uploadUrl: url
       })
     }

   function getUploadUrl(todoId: string) {
     return s3.getSignedUrl('putObject', {
       Bucket: bucketName,
       Key: todoId,
       Expires: urlExpiration
     })
   }
}
