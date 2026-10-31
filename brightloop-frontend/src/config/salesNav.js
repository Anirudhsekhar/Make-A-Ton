import {
  FileText,
  LayoutDashboard,
  Layers,
  ReceiptText,
  UserRound,
  Users,
} from 'lucide-react'

export const SALES_NAV = Object.freeze([
  {
    label: 'Overview',
    to: '/sales/dashboard',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'Customers',
    to: '/sales/customers',
    icon: Users,
  },
  {
    label: 'Quotation Templates',
    to: '/sales/quotations',
    icon: FileText,
  },
  {
    label: 'Subscriptions',
    to: '/sales/subscriptions',
    icon: Layers,
  },
  {
    label: 'Invoices',
    to: '/sales/invoices',
    icon: ReceiptText,
  },
  {
    label: 'Profile',
    to: '/sales/profile',
    icon: UserRound,
  },
])
