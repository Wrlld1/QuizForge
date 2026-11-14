if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set in environment variables. Using insecure default. Set JWT_SECRET for production!')
}

export const JWT_SECRET = process.env.JWT_SECRET || 'quizforge-dev-secret'
