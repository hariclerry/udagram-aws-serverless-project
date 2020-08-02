import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { getTodos } from '../../businessLogic/todo'
import { createLogger } from '../../utils/logger'

const logger = createLogger('get')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user
    logger.info(`Processing event ${event}`)

    const authHeader = event.headers.Authorization
    const todos = await getTodos(authHeader)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
  }
).use(cors())