import AWS from 'aws-sdk'
import { v4 as uuid } from 'uuid'
import bcrypt from 'bcryptjs'

import { APIGatewayProxyHandlerV2 as Handler } from 'aws-lambda'
import wrap from '@dazn/lambda-powertools-pattern-basic'

import 'source-map-support/register'

import { invalidRequest, created } from '../utils/httpResponse'
import { document } from '../utils/dynamoDBClient'

const SES = new AWS.SES()

type RegisterRequest = {
  name: string
  email: string
  password: string
}

export const handle = wrap<Handler>(async event => {
  const { name, email, password } = JSON.parse(event.body) as RegisterRequest

  if (!name || !email || !password) {
    return invalidRequest('Required parameters are missing in the request.')
  }

  const hasUserWithSameEmail = await document
    .query({
      TableName: 'users',
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    })
    .promise()

  if (hasUserWithSameEmail.Count > 0) {
    return invalidRequest('User already exists.', 409)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await document
    .put({
      TableName: 'users',
      Item: {
        id: uuid(),
        name,
        email,
        password: hashedPassword,
        registrationToken: uuid(),
        createdAt: Date.now()
      }
    })
    .promise()

  await SES.sendTemplatedEmail({
    Template: 'RegistrationEmail',
    TemplateData: JSON.stringify({
      name,
      link: 'https://google.com'
    }),
    Destination: {
      ToAddresses: [`${name} <${email}>`]
    },
    Source: 'Equipe Rocketseat <oi@rocketseat.com.br>'
  }).promise()

  return created()
})
