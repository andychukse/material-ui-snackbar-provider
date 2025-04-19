import '@testing-library/jest-dom'
// Fail tests on any warning
console.error = message => {
  throw new Error(message)
}
