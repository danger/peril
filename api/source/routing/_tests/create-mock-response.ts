import { Response } from "express"

export const createMockResponse = () => {
  const res = jest.fn() as jest.Mock<Response> & Response
  res.status = jest.fn(() => res)
  res.send = jest.fn()
  return res
}
