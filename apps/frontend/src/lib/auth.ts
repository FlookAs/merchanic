import { jwtDecode } from 'jwt-decode'
import type { JwtPayload } from '@/types'

export function decodeToken(token: string): JwtPayload {
  return jwtDecode<JwtPayload>(token)
}
