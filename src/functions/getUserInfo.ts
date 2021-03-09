import { APIGatewayProxyWithLambdaAuthorizerHandler as Handler } from 'aws-lambda'
import wrap from '@dazn/lambda-powertools-pattern-basic'

import 'source-map-support/register'
import { jsonResponse } from '../utils/httpResponse'

type AuthContext = {
  principalId: string
}

export const handle = wrap<Handler<AuthContext>>(async event => {
  const userId = event.requestContext.authorizer.principalId

  return jsonResponse({
    userId
  })
})
