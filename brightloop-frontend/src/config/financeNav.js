import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Layers,
  ReceiptText,
  UserRound,
} from 'lucide-react'

export const FINANCE_NAV = Object.freeze([
  {
    label: 'Overview',
    to: '/finance/dashboard',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'Subscriptions',
    to: '/finance/subscriptions',
    icon: Layers,
  },
  {
    label: 'Invoices',
    to: '/finance/invoices',
    icon: ReceiptText,
  },
  {
    label: 'Payments',
    to: '/finance/payments',
    icon: CreditCard,
  },
  {
    label: 'Finance Dashboard',
    to: '/finance/analytics',
    icon: BarChart3,
  },
  {
    label: 'Profile',
    to: '/finance/profile',
    icon: UserRound,
  },
])
