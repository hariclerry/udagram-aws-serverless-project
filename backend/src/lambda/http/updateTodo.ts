import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLogic/todo'
import { createLogger } from '../../utils/logger'

const logger = createLogger('update')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event ${event}`)

    const { todoId } = event.pathParameters
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const authHeader = event.headers.Authorization

    await updateTodo(todoId, updatedTodo, authHeader)

    return {
      statusCode: 200,
      body: JSON.stringify(updatedTodo)
    }
  }
).use(cors())
