import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { getUserId } from '../auth/utils'

const todoAccess = new TodoAccess()

export async function getTodos(authHeader: string) {
  const userId = getUserId(authHeader)
  const todos = await todoAccess.getTodos(userId)
  return todos
}

export async function createTodo(
  createNewTodo: CreateTodoRequest,
  authHeader: string
) {
  const userId = getUserId(authHeader)

  const todoId = uuid.v4()
  const done = false
  const dueDate = new Date(createNewTodo.dueDate).toISOString()
  const createdAt = new Date().toISOString()

  const newTodo = {
    todoId,
    userId,
    createdAt,
    done,
    dueDate,
    ...createNewTodo
  } as TodoItem

  await todoAccess.createTodo(newTodo)

  return newTodo
}

export async function updateTodo(
  todoId: string,
  updatedTodo: UpdateTodoRequest,
  authHeader: string
) {
  const { done } = updatedTodo
  const userId = getUserId(authHeader)

  await todoAccess.updateTodo(todoId, done, userId)
  return updatedTodo
}

export async function deleteTodo(todoId: string, authHeader: string) {
  const userId = getUserId(authHeader)
  return await todoAccess.deleteTodo(todoId, userId)
}

export async function uploadTodoAttachment(
  todoId: string,
  authHeader: string,
  attachmentUrl: string
) {
  const userId = getUserId(authHeader)
  await todoAccess.uploadTodoAttachment(todoId, userId, attachmentUrl)
}
