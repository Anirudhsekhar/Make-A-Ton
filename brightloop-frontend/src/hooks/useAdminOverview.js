import { useCallback, useEffect, useState } from 'react'
import { fetchAdminOverview } from '../services/admin/overviewService'

const INITIAL_STATE = {
  status: 'loading',
  data: null,
  error: '',
}

export function useAdminOverview() {
  const [state, setState] = useState(INITIAL_STATE)
  const [requestKey, setRequestKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    fetchAdminOverview({ signal: controller.signal })
      .then((data) => {
        if (!active) return
        setState({ status: 'success', data, error: '' })
      })
      .catch((error) => {
        if (!active || error?.name === 'AbortError') return
        setState({
          status: 'error',
          data: null,
          error:
            error instanceof Error
              ? error.message
              : 'The overview data could not be loaded.',
        })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [requestKey])

  const reload = useCallback(() => {
    setState({ status: 'loading', data: null, error: '' })
    setRequestKey((current) => current + 1)
  }, [])

  return { ...state, reload }
}
