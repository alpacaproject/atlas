import { APIGatewayProxyResultV2 } from 'aws-lambda'

export function jsonResponse(
  body: Record<string, any>,
  statusCode = 200
): APIGatewayProxyResultV2 {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  }
}

export function invalidRequest(
  description: string,
  statusCode = 400
): APIGatewayProxyResultV2 {
  return jsonResponse(
    {
      error: 'invalid_request',
      description
    },
    statusCode
  )
}
