import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

export class TodoAccess {
  constructor(
    private docClient: DocumentClient = createDynamoDBClient(),
    private todosTable = process.env.TODOS_TABLE
  ) {}

  async getTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    return result.Items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()

    return todo as TodoItem
  }

  async updateTodo(todoId: string, done: boolean, userId: string) {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: { todoId, userId },
      UpdateExpression: 'set done = :done',
      ConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
        ':todoId': todoId,
        ':done': done
      }
    }).promise()
  }

  async deleteTodo(todoId: string, userId: string): Promise<string> {
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { todoId, userId }
      })
      .promise()
    return Promise.resolve(todoId)
  }

  async uploadTodoAttachment(
    todoId: string,
    userId: string,
    attachmentUrl: string
  ): Promise<void> {
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { todoId, userId },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
          ':todoId': todoId,
          ':attachmentUrl': attachmentUrl
        }
      })
      .promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
