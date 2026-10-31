import { useLocation } from 'react-router-dom'
import { DEMO_CUSTOMER_BASE } from '../config/customerDemo'

export function useCustomerBasePath() {
  const { pathname } = useLocation()
  return pathname.startsWith(DEMO_CUSTOMER_BASE) ? DEMO_CUSTOMER_BASE : '/customer'
}
