import { APIGatewayProxyWithLambdaAuthorizerHandler as Handler } from 'aws-lambda'
import wrap from '@dazn/lambda-powertools-pattern-basic'

import 'source-map-support/register'
import { invalidRequest, jsonResponse } from '../utils/httpResponse'
import { document } from '../utils/dynamoDBClient'

type AuthContext = {
  principalId: string
}

export const handle = wrap<Handler<AuthContext>>(async event => {
  const { token, email } = event.queryStringParameters

  if (!email || !token) {
    return invalidRequest('Required parameters are missing in the request.')
  }

  const response = await document
    .query({
      TableName: 'users',
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    })
    .promise()

  if (response.Count === 0) {
    return invalidRequest('User not found.')
  }

  const user = response.Items[0]

  if (user.confirmed) {
    return invalidRequest('User already confirmed.', 409)
  }

  const tokenMatches = user.registrationToken === token

  if (!tokenMatches) {
    return invalidRequest('Token does not match.')
  }

  await document
    .update({
      TableName: 'users',
      Key: {
        id: user.id
      },
      UpdateExpression:
        'set confirmed = :confirmed, registrationToken = :registrationToken',
      ExpressionAttributeValues: {
        ':confirmed': true,
        ':registrationToken': null
      }
    })
    .promise()

  return jsonResponse({
    ok: true
  })
})
