import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'
// Ensure the key is exactly 32 bytes. If the ENCRYPTION_KEY is a 64-char hex string, we parse it as hex.
// If it's just a regular 32-char string, we can use it directly. We'll try to parse as hex first.
const getKey = () => {
  const keyStr = process.env.ENCRYPTION_KEY
  if (!keyStr) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }
  
  if (keyStr.length === 64) {
    return Buffer.from(keyStr, 'hex')
  } else if (keyStr.length === 32) {
    return Buffer.from(keyStr, 'utf8')
  }
  
  throw new Error('ENCRYPTION_KEY must be exactly 32 bytes (32 characters or 64 hex characters)')
}

export function encryptToken(text: string): string {
  const iv = crypto.randomBytes(16)
  const key = getKey()
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  // Return the IV and the encrypted text, separated by a colon
  return `${iv.toString('hex')}:${encrypted}`
}

export function decryptToken(encryptedData: string): string {
  const [ivHex, encryptedText] = encryptedData.split(':')
  
  if (!ivHex || !encryptedText) {
    throw new Error('Invalid encrypted token format')
  }
  
  const iv = Buffer.from(ivHex, 'hex')
  const key = getKey()
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
