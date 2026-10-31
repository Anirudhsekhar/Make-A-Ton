import { CalendarClock, LayoutDashboard, ReceiptText, UserRound } from 'lucide-react'

export const CUSTOMER_NAV = Object.freeze([
  {
    label: 'Overview',
    to: '/customer/dashboard',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'My Subscriptions',
    to: '/customer/subscriptions',
    icon: CalendarClock,
  },
  {
    label: 'My Invoices',
    to: '/customer/invoices',
    icon: ReceiptText,
  },
  {
    label: 'My Account',
    to: '/customer/account',
    icon: UserRound,
  },
])
