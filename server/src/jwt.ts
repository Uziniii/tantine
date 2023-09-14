import jwt from "jsonwebtoken"

export function generateAccessToken(id: string) {
  return jwt.sign(id, process.env.SECRET);
}
