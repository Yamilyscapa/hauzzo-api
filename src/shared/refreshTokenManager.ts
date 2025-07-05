import { pool } from '../database/client'
import { createHash } from 'crypto'

export interface RefreshTokenData {
  id: string
  broker_id: string
  token_hash: string
  expires_at: Date
  created_at: Date
  revoked_at: Date | null
  device_info: string | null
}

// Store refresh token in database
export async function storeRefreshToken(
  brokerId: string,
  refreshToken: string,
  deviceInfo?: string
): Promise<void> {
  const tokenHash = createHash('sha256').update(refreshToken).digest('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const query = {
    text: `
      INSERT INTO refresh_tokens (broker_id, token_hash, expires_at, device_info)
      VALUES ($1, $2, $3, $4)
    `,
    values: [brokerId, tokenHash, expiresAt, deviceInfo || null],
  }

  await pool.query(query)
}

// Verify refresh token exists and is valid
export async function verifyRefreshToken(
  refreshToken: string
): Promise<RefreshTokenData | null> {
  const tokenHash = createHash('sha256').update(refreshToken).digest('hex')

  const query = {
    text: `
      SELECT * FROM refresh_tokens 
      WHERE token_hash = $1 
      AND expires_at > NOW() 
      AND revoked_at IS NULL
    `,
    values: [tokenHash],
  }

  const { rows } = await pool.query(query)
  return rows.length > 0 ? rows[0] : null
}

// Revoke refresh token
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const tokenHash = createHash('sha256').update(refreshToken).digest('hex')

  const query = {
    text: `
      UPDATE refresh_tokens 
      SET revoked_at = NOW()
      WHERE token_hash = $1
    `,
    values: [tokenHash],
  }

  await pool.query(query)
}

// Revoke all refresh tokens for a broker
export async function revokeAllTokensForBroker(
  brokerId: string
): Promise<void> {
  const query = {
    text: `
      UPDATE refresh_tokens 
      SET revoked_at = NOW()
      WHERE broker_id = $1 AND revoked_at IS NULL
    `,
    values: [brokerId],
  }

  await pool.query(query)
}

// Clean up expired tokens
export async function cleanupExpiredTokens(): Promise<void> {
  const query = {
    text: `SELECT cleanup_expired_refresh_tokens()`,
    values: [],
  }

  await pool.query(query)
}

// Helper function to generate token hash
export function generateTokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// Helper function to create expiration date
export function createExpirationDate(days: number = 7): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

// Functional composition example: Rotate refresh token (revoke old + store new)
export async function rotateRefreshToken(
  oldRefreshToken: string,
  brokerId: string,
  newRefreshToken: string,
  deviceInfo?: string
): Promise<void> {
  // Compose functions: revoke old token then store new token
  await revokeRefreshToken(oldRefreshToken)
  await storeRefreshToken(brokerId, newRefreshToken, deviceInfo)
}
