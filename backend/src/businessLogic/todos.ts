import { TodosAccess } from '../dataLayer/todosAccess'
import { TodoItem } from '../models/TodoItem'
import {
  CreateTodoRequest,
} from '../requests/CreateTodoRequest';

import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { TodoUpdate } from '../models/TodoUpdate';
import {createLogger} from '../utils/logger';

import * as uuid from 'uuid'

const logger = createLogger('todosBusinessLogic');

const todosAccess = new TodosAccess();

export async function getTodos(userId: string): Promise<TodoItem[]> {
  return todosAccess.getTodos(userId);
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()

  logger.info('UserId ' + userId);

  return todosAccess.createTodo({
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    attachmentUrl: ''
  })
}

export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<string>{
  return todosAccess.deleteTodo(userId, todoId);
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<TodoUpdate>{

  const updatedTodo: TodoUpdate = {
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
}

  return await todosAccess.updateTodo(userId, todoId, updatedTodo);
}

export async function generateUploadUrl(userId:string, todoId: string){
  return await todosAccess.generateUploadUrl(userId, todoId);
}
