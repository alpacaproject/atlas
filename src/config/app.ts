export const config = {
  baseURL: process.env.IS_OFFLINE
    ? 'http://localhost:3000/local'
    : process.env.BASE_URL
}
