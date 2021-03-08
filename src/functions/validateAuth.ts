import { APIGatewayTokenAuthorizerHandler } from 'aws-lambda'
import wrap from '@dazn/lambda-powertools-pattern-basic'

import 'source-map-support/register'

export const handle = wrap<APIGatewayTokenAuthorizerHandler>(async event => {
  const authHeader = event.authorizationToken

  if (!authHeader) {
    throw new Error('Unauthorized')
  }

  const [signature, token] = authHeader.split(' ')

  if (signature.toLowerCase() !== 'bearer' || !token) {
    throw new Error('Unauthorized')
  }

  return {
    principalId: 'user-id',
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
})
