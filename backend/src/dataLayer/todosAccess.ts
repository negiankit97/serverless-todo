import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const logger = createLogger('todo')
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todoTable = process.env.TODOS_TABLE,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET
  ) {}

  async getTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.todoTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    logger.info('Todo retrieved successfully')

    const todos = result.Items

    return todos as TodoItem[]
  }
  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todoTable,
        Item: todo
      })
      .promise()

    return todo
  }

  async deleteTodo(userId: string, todoId: string): Promise<string> {
    await this.docClient
      .delete({
        TableName: this.todoTable,
        Key: {
          userId,
          todoId
        }
      })
      .promise()

    logger.info('delete successfull')

    return todoId
  }
  async updateTodo(
    userId: string,
    todoId: string,
    todoUpdate: TodoUpdate
  ): Promise<TodoUpdate> {
    var params = {
      TableName: this.todoTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: 'set #n = :r, dueDate=:p, done=:a',
      ExpressionAttributeValues: {
        ':r': todoUpdate.name,
        ':p': todoUpdate.dueDate,
        ':a': todoUpdate.done
      },
      ExpressionAttributeNames: {
        '#n': 'name'
      },
      ReturnValues: 'UPDATED_NEW'
    }

    await this.docClient.update(params).promise()
    logger.info('Update was successful')
    return todoUpdate
  }

  async generateUploadUrl(userId: string, todoId: string): Promise<String> {
    const url = getUploadUrl(todoId, this.bucketName)

    const attachmentUrl: string =
      'https://' + this.bucketName + '.s3.amazonaws.com/' + todoId

    const options = {
      TableName: this.todoTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: 'set attachmentUrl = :r',
      ExpressionAttributeValues: {
        ':r': attachmentUrl
      },
      ReturnValues: 'UPDATED_NEW'
    }

    await this.docClient.update(options).promise()
    logger.info('Presigned url generated successfully ', url)

    return url
  }
}

function getUploadUrl(todoId: string, bucketName: string): string {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: parseInt(urlExpiration)
  })
}
