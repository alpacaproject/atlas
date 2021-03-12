import { APIGatewayProxyWithLambdaAuthorizerHandler as Handler } from 'aws-lambda'
import wrap from '@dazn/lambda-powertools-pattern-basic'

import 'source-map-support/register'
import { invalidRequest, jsonResponse } from '../utils/httpResponse'
import { document } from '../utils/dynamoDBClient'

type AuthContext = {
  principalId: string
}

export const handle = wrap<Handler<AuthContext>>(async event => {
  const userId = event.requestContext.authorizer.principalId

  const response = await document
    .query({
      TableName: 'users',
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': userId
      }
    })
    .promise()

  const userDoesNotExists = response.Count === 0

  if (userDoesNotExists) {
    return invalidRequest('User does not exists')
  }

  const { id, name, email } = response.Items[0]

  return jsonResponse({
    data: {
      id,
      name,
      email
    }
  })
})
