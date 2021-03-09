import { APIGatewayProxyResult } from 'aws-lambda'

export function created(): APIGatewayProxyResult {
  return {
    statusCode: 201,
    body: null,
    headers: {
      'Content-Type': 'application/json'
    }
  }
}

export function jsonResponse(
  body: Record<string, any>,
  statusCode = 200
): APIGatewayProxyResult {
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
): APIGatewayProxyResult {
  return jsonResponse(
    {
      error: 'invalid_request',
      description
    },
    statusCode
  )
}
