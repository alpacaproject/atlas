import AWS from 'aws-sdk'

const options = {
  region: 'localhost',
  endpoint: 'http://localhost:8000'
}

const isOffline = () => {
  return process.env.IS_OFFLINE
}

export const document = isOffline()
  ? new AWS.DynamoDB.DocumentClient(options)
  : new AWS.DynamoDB.DocumentClient()

export const raw = isOffline() ? new AWS.DynamoDB(options) : new AWS.DynamoDB()
