import { APIGatewayTokenAuthorizerHandler as Handler } from 'aws-lambda'
import jwt from 'jsonwebtoken'
import wrap from '@dazn/lambda-powertools-pattern-basic'

import 'source-map-support/register'

type JWTPayload = {
  sub: string
}

export const handle = wrap<Handler>(async event => {
  const authHeader = event.authorizationToken

  if (!authHeader) {
    throw new Error('Unauthorized')
  }

  const [signature, token] = authHeader.split(' ')

  if (signature.toLowerCase() !== 'bearer' || !token) {
    throw new Error('Unauthorized')
  }

  try {
    const decoded = jwt.verify(token, process.env.PUBLIC_KEY, {
      algorithms: ['RS256']
    })

    const { sub } = decoded as JWTPayload

    return {
      principalId: sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn
          }
        ]
      }
    }
  } catch (err) {
    throw new Error(process.env.PUBLIC_KEY)
  }
})
