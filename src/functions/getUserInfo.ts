import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import wrap from '@dazn/lambda-powertools-pattern-basic'

import 'source-map-support/register'
import { jsonResponse } from './utils/httpResponse'

export const handle = wrap<APIGatewayProxyHandlerV2>(async () => {
  return jsonResponse({
    ok: true
  })
})
