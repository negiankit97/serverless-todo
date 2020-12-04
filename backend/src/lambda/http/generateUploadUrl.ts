import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger';
import {generateUploadUrl} from '../../businessLogic/todos';

const logger = createLogger('generateUploadUrl');
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event', event);
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event);

  const uploadUrl = await generateUploadUrl(userId, todoId); 

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body:JSON.stringify({
      uploadUrl
    })
  }
}
