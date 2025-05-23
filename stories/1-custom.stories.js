import React from 'react'
import { SnackbarProvider, useSnackbar } from '../src'
import { Button, Snackbar, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import useCustomSnackbar from './CustomSnackbar/useCustomSnackbar'
import CustomSnackbar from './CustomSnackbar/CustomSnackbar'

export default {
  title: 'SnackbarProvider'
}

export const withCloseButton = () => {
  function InnerComponent () {
    const snackbar = useSnackbar()
    const handleShowSnackbar = React.useCallback(() => {
      snackbar.showMessage('Something happened.', 'Undo', () => {
        snackbar.showMessage('Undo successful.')
      })
    }, [snackbar])

    return <Button onClick={handleShowSnackbar}>Show snackbar</Button>
  }

  function CloseableSnackbar ({ message, action, ButtonProps, SnackbarProps }) {
    const handleClose = SnackbarProps.onClose
    return (
      <Snackbar
        {...SnackbarProps}
        message={message}
        action={
          <>
            {action != null && (
              <Button color='secondary' size='small' {...ButtonProps}>
                {action}
              </Button>
            )}
            <IconButton
              aria-label='close'
              color='inherit'
              size='small'
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
          </>
        }
      />
    )
  }

  return (
    <SnackbarProvider SnackbarComponent={CloseableSnackbar}>
      <InnerComponent />
    </SnackbarProvider>
  )
}

export const withCustomSnackbar = () => {
  function InnerComponent () {
    const snackbar = useCustomSnackbar()
    const handleShowSnackbar = React.useCallback(() => {
      snackbar.showWarning('Something happened.', 'Undo', () => {
        snackbar.showInfo('Undo successful.')
      })
    }, [snackbar])

    return <Button onClick={handleShowSnackbar}>Show custom snackbar</Button>
  }

  return (
    <SnackbarProvider SnackbarComponent={CustomSnackbar}>
      <InnerComponent />
    </SnackbarProvider>
  )
}
