import jwt from 'jsonwebtoken'
import { APIGatewayProxyHandlerV2 as Handler } from 'aws-lambda'
import wrap from '@dazn/lambda-powertools-pattern-basic'

import 'source-map-support/register'
import { invalidRequest, jsonResponse } from '../utils/httpResponse'

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

  const expiresIn = 60 * 15 // 15 minutes

  const accessToken = jwt.sign({}, process.env.PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn,
    issuer: 'atlas',
    subject: 'user-id'
  })

  const refreshToken = 'refresh'

  return jsonResponse({
    token_type: 'Bearer',
    expires_in: expiresIn,
    access_token: accessToken,
    refresh_token: refreshToken
  })
})
