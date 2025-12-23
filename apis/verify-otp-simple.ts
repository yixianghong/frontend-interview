type Payload = {
  otp: string
}

type Response = {
  success: boolean
  data: {
    verified: boolean,
    timestamp: string
  }
}

const verify = (payload: Payload) => useHttp().post('/examples/verify-otp-simple', {
  body: {
    ...payload
  }
}) as Promise<Response>

export default {
  verify
}
