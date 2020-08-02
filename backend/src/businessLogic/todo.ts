import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'
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

export async function updateTodo( todoId: string,
  updateTodoItem: UpdateTodoRequest,
  authHeader: string
) {
  const userId = getUserId(authHeader)
  const todoUpdate: TodoUpdate = {
    ...updateTodoItem
  }
  await todoAccess.updateTodo(todoId, todoUpdate, userId)
  return todoUpdate
}

export async function deleteTodo(todoId: string, authHeader: string) {
  const userId = getUserId(authHeader)
  return await todoAccess.deleteTodo(todoId, userId)
}
