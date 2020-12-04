import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);

  const id = await deleteTodo(userId, todoId);
  // TODO: Remove a TODO item by id
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': "*",
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      mssg: "Successfully deleted!",
      todoId: id
    })
  }
}
