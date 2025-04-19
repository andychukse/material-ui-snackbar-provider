/* eslint-env jest */
import React from 'react'
import { render, screen } from '@testing-library/react' // Import render and screen
import withSnackbar from './withSnackbar'
import SnackbarContext from './SnackbarContext'

describe('withSnackbar', () => {
  it('adds a snackbar prop to the wrapped component', () => {
    // Define a mock context value
    const dummySnackbarContext = {
      showMessage: jest.fn()
    }

    // Define a simple component that will receive the prop
    const InnerComponent = (props) => {
      // Access the injected prop and display something for verification
      return <div data-testid='inner'>{props.snackbar ? 'has-snackbar' : 'no-snackbar'}</div>
    }

    // Wrap the component using the HOC
    const ComponentWithSnackbar = withSnackbar()(InnerComponent)

    // Render the wrapped component within the context provider
    render(
      <SnackbarContext.Provider value={dummySnackbarContext}>
        <ComponentWithSnackbar />
      </SnackbarContext.Provider>
    )

    // Verify that the inner component received the snackbar prop
    // We check the text content rendered based on the prop's presence
    expect(screen.getByTestId('inner')).toHaveTextContent('has-snackbar')

    // Optional: If you need to check the exact value, you'd need to capture it
    // This is harder with HOCs in RTL compared to hooks. The above check is usually sufficient.
  })
})
