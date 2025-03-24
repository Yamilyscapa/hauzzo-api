function validatePassword(password: string): boolean {
  const REGEX =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

  return REGEX.test(password)
}

export default validatePassword
