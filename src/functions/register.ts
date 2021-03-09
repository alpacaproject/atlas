import AWS from 'aws-sdk'
import { v4 as uuid } from 'uuid'

import { APIGatewayProxyHandlerV2 as Handler } from 'aws-lambda'
import wrap from '@dazn/lambda-powertools-pattern-basic'

import 'source-map-support/register'
import { invalidRequest, created } from '../utils/httpResponse'

const DDB = new AWS.DynamoDB.DocumentClient({
  endpoint: 'http://localhost:8000'
})

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

  const hasUserWithSameEmail = await DDB.query({
    TableName: 'users',
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    }
  }).promise()

  if (hasUserWithSameEmail.Count > 0) {
    return invalidRequest('User already exists.', 409)
  }

  await DDB.put({
    TableName: 'users',
    Item: {
      id: uuid(),
      name,
      email,
      password
    }
  }).promise()

  return created()
})
