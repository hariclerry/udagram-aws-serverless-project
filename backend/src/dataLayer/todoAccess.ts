import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

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

  async updateTodo(
    todoId: string,
    todo: TodoUpdate,
    userId: string
  ): Promise<TodoUpdate> {
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { todoId, userId },
        UpdateExpression: 'SET #nm = :name, dueDate = :dueDate, done = :done',
        ConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
          ':name': todo.name,
          ':dueDate': todo.dueDate,
          ':done': todo.done
        }
      })
      .promise()
    return todo as TodoUpdate
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
