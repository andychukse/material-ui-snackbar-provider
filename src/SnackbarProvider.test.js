/* eslint-env jest */
import React from 'react'
// Remove unused fireEvent import
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SnackbarProvider from './SnackbarProvider'
import SnackbarContext from './SnackbarContext'
import { ThemeProvider, createTheme } from '@mui/material/styles' // Needed for MUI components

// Helper component to access the context value
const SnackBarContextConsumer = ({ onSnackbarReceived }) => {
  const snackbar = React.useContext(SnackbarContext)
  React.useEffect(() => {
    if (snackbar) {
      onSnackbarReceived(snackbar)
    }
  }, [snackbar, onSnackbarReceived])
  return null // This component doesn't render anything itself
}

// MUI requires a ThemeProvider
const AllTheProviders = ({ children }) => {
  const theme = createTheme()
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  )
}

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options })

describe('SnackbarProvider', () => {
  let snackbarInstance

  // Helper to render provider and capture snackbar context
  const renderWithSnackbar = (providerProps = {}, consumerProps = {}) => {
    const handleSnackbarReceived = jest.fn((snackbar) => {
      snackbarInstance = snackbar
    })

    // Wrap initial render in act if it causes immediate effects/updates
    // (Though render usually handles this, being explicit can sometimes help)
    let utils
    act(() => {
      utils = customRender(
        <SnackbarProvider {...providerProps}>
          <SnackBarContextConsumer onSnackbarReceived={handleSnackbarReceived} {...consumerProps} />
        </SnackbarProvider>
      )
    })

    // Ensure snackbarInstance is captured - might need waitFor if context is async
    // waitFor(() => expect(handleSnackbarReceived).toHaveBeenCalled());
    // If context is set synchronously on mount, this is fine:
    expect(handleSnackbarReceived).toHaveBeenCalled()

    return { ...utils, snackbar: snackbarInstance }
  }

  beforeEach(() => {
    snackbarInstance = null
    // Ensure timers are real by default for each test
    jest.useRealTimers()
  })

  it('adds a snackbar property to the context', () => {
    renderWithSnackbar()
    expect(snackbarInstance).toEqual({
      showMessage: expect.any(Function)
    })
  })

  it('does not display a snackbar by default', () => {
    renderWithSnackbar()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a snackbar after calling showMessage', async () => {
    const { snackbar } = renderWithSnackbar()
    // Wrap state update in act
    act(() => {
      snackbar.showMessage('Something went wrong')
    })

    const snackbarElement = await screen.findByRole('alert')
    expect(snackbarElement).toBeInTheDocument()
    expect(snackbarElement).toHaveTextContent('Something went wrong')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('can display an action button', async () => {
    const { snackbar } = renderWithSnackbar()
    // Wrap state update in act
    act(() => {
      snackbar.showMessage('Something went wrong', 'Retry', () => {})
    })

    const button = await screen.findByRole('button', { name: /Retry/i })
    expect(button).toBeInTheDocument()
  })

  it('calls the action callback after clicking the button and closes the snackbar', async () => {
    const user = userEvent.setup()
    const actionCallback = jest.fn()
    const { snackbar } = renderWithSnackbar()

    // Wrap state update in act
    act(() => {
      snackbar.showMessage('Something went wrong', 'Retry', actionCallback)
    })

    const button = await screen.findByRole('button', { name: /Retry/i })
    // userEvent actions are already wrapped in act
    await user.click(button)

    expect(actionCallback).toHaveBeenCalledTimes(1)

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  it('calls the close callback after closing the snackbar (e.g., autoHideDuration)', async () => {
    jest.useFakeTimers()
    const actionCallback = jest.fn()
    const closeCallback = jest.fn()
    // Pass autoHideDuration via SnackbarProps correctly
    const { snackbar } = renderWithSnackbar({ SnackbarProps: { autoHideDuration: 100 } })

    // Wrap state update in act
    act(() => {
      // Pass closeCallback as the 5th argument
      snackbar.showMessage('Auto closing', 'Action', actionCallback, undefined, closeCallback)
    })

    // Wait for snackbar to appear
    await screen.findByRole('alert')

    // Fast-forward timers - wrap in act
    act(() => {
      jest.advanceTimersByTime(150) // More than autoHideDuration
    })

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    expect(actionCallback).not.toHaveBeenCalled()
    expect(closeCallback).toHaveBeenCalledTimes(1)

    // No need to call jest.useRealTimers() here, handled by beforeEach
  })

  it('does not call the close callback after clicking the button', async () => {
    const user = userEvent.setup()
    const actionCallback = jest.fn()
    const closeCallback = jest.fn()
    const { snackbar } = renderWithSnackbar()

    // Wrap state update in act
    act(() => {
      snackbar.showMessage('Something went wrong', 'Retry', actionCallback, undefined, closeCallback)
    })

    const button = await screen.findByRole('button', { name: /Retry/i })
    // userEvent actions are already wrapped in act
    await user.click(button)

    expect(actionCallback).toHaveBeenCalledTimes(1)
    expect(closeCallback).not.toHaveBeenCalled()

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  it('propagates SnackbarProps to the Snackbar component', async () => {
    const { snackbar } = renderWithSnackbar({ SnackbarProps: { 'data-testid': 'custom-snackbar' } })
    // Wrap state update in act
    act(() => {
      snackbar.showMessage('Test')
    })

    const snackbarElement = await screen.findByTestId('custom-snackbar')
    expect(snackbarElement).toBeInTheDocument()
  })

  it('propagates ButtonProps to the action Button component', async () => {
    const { snackbar } = renderWithSnackbar({ ButtonProps: { 'data-testid': 'custom-button' } })
    // Wrap state update in act
    act(() => {
      snackbar.showMessage('Internet deleted', 'Undo', () => {})
    })

    const button = await screen.findByTestId('custom-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Undo')
  })

  it('supports custom snackbar renderers', async () => {
    const user = userEvent.setup()
    const CustomSnackbarComponent = jest.fn(({ message, action, ButtonProps, SnackbarProps, customParameters }) => {
      const { open } = SnackbarProps || {}
      const { onClick, ...otherButtonProps } = ButtonProps || {}

      if (!open) return null

      return (
        <div role='alert' data-testid='custom-renderer'>
          Custom: {message} - Param: {customParameters?.type}
          {action && (
            <button onClick={onClick} {...otherButtonProps}>
              {action}
            </button>
          )}
        </div>
      )
    })

    const { snackbar } = renderWithSnackbar({ SnackbarComponent: CustomSnackbarComponent })

    const handleAction = jest.fn()
    act(() => {
      snackbar.showMessage('Test', 'Action', handleAction, { type: 'error' })
    })

    const customElement = await screen.findByTestId('custom-renderer')
    expect(customElement).toBeInTheDocument()
    expect(customElement).toHaveTextContent('Custom: Test - Param: error')

    const lastCallArgs = CustomSnackbarComponent.mock.calls[CustomSnackbarComponent.mock.calls.length - 1]
    const receivedProps = lastCallArgs[0]

    expect(receivedProps.message).toBe('Test')
    expect(receivedProps.action).toBe('Action')
    expect(receivedProps.customParameters).toEqual({ type: 'error' })
    expect(receivedProps.SnackbarProps).toBeDefined()
    expect(receivedProps.SnackbarProps.open).toBe(true)
    expect(receivedProps.ButtonProps).toBeDefined()
    expect(receivedProps.ButtonProps.onClick).toEqual(expect.any(Function))

    const button = screen.getByRole('button', { name: /Action/i })
    await user.click(button)

    expect(handleAction).toHaveBeenCalledTimes(1)

    await waitFor(() => {
      expect(screen.queryByTestId('custom-renderer')).not.toBeInTheDocument()
    })
  })
})
