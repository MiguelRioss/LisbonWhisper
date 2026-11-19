import crypto from 'crypto';

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'lisbonWhisper456fgh';
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 12;

export default function createDatabaseAdminSessionData({
  username = process.env.DATABASE_ADMIN_USERNAME || DEFAULT_USERNAME,
  password = process.env.DATABASE_ADMIN_PASSWORD || DEFAULT_PASSWORD,
  tokenTtlMs = Number(process.env.DATABASE_TOKEN_TTL_MS || DEFAULT_TTL_MS),
} = {}) {
  let activeSession = null;

  return {
    verifyCredentials,
    createSession,
    getActiveSession,
    clearSession,
  };

  function verifyCredentials(inputUsername, inputPassword) {
    const safeUsername = String(inputUsername || '').trim();
    const safePassword = String(inputPassword || '');
    return safeUsername === username && safePassword === password;
  }

  function createSession(sessionUsername) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + tokenTtlMs;

    activeSession = {
      token,
      username: String(sessionUsername || '').trim(),
      expiresAt,
    };

    return { ...activeSession };
  }

  function getActiveSession() {
    return activeSession ? { ...activeSession } : null;
  }

  function clearSession() {
    activeSession = null;
  }
}
