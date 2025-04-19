/* eslint-env jest */
import React from 'react'
import { render } from '@testing-library/react' // Import render from RTL
import SnackbarContext from './SnackbarContext'
import useSnackbar from './useSnackbar'

describe('useSnackbar', () => {
  it('injects the snackbar object from context', () => {
    // Define a mock context value
    const dummySnackbarContext = {
      showMessage: jest.fn() // Use jest.fn() for mock function
    }

    // Create a simple component that uses the hook
    let capturedSnackbar
    const TestComponent = () => {
      capturedSnackbar = useSnackbar() // Call the hook
      return null // Component doesn't need to render anything for this test
    }

    // Render the component within the context provider
    render(
      <SnackbarContext.Provider value={dummySnackbarContext}>
        <TestComponent />
      </SnackbarContext.Provider>
    )

    // Assert that the hook returned the context value
    expect(capturedSnackbar).toBe(dummySnackbarContext)
  })
})
