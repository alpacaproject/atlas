import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import { APIGatewayProxyHandler as Handler } from 'aws-lambda'
import wrap from '@dazn/lambda-powertools-pattern-basic'

import 'source-map-support/register'
import { invalidRequest, jsonResponse } from '../utils/httpResponse'
import { document } from '../utils/dynamoDBClient'

type AuthenticateRequest = {
  email: string
  password: string
  client_id: string
  client_secret: string
}

export const handle = wrap<Handler>(async event => {
  const { email, password, client_id, client_secret } = JSON.parse(
    event.body
  ) as AuthenticateRequest

  if (!email || !password || !client_id || !client_secret) {
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

  const user = response.Items[0]

  if (!user) {
    return invalidRequest('Invalid e-mail/password combination.')
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    return invalidRequest('Invalid e-mail/password combination.')
  }

  if (!user.confirmed) {
    return invalidRequest('User is not confirmed, check your e-mail.')
  }

  const expiresIn = 60 * 15 // 15 minutes

  const accessToken = jwt.sign({}, process.env.PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn,
    issuer: 'atlas',
    subject: user.id
  })

  const refreshToken = 'refresh'

  const { sourceIp, userAgent } = event.requestContext.identity

  await document
    .put({
      TableName: 'authentication_logs',
      Item: {
        id: uuid(),
        userId: user.id,
        sourceIp,
        userAgent,
        createdAt: Date.now()
      }
    })
    .promise()

  return jsonResponse({
    token_type: 'Bearer',
    expires_in: expiresIn,
    access_token: accessToken,
    refresh_token: refreshToken
  })
})
