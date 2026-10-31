import {
  BadgePercent,
  Layers,
  LayoutDashboard,
  Package,
  Percent,
  Users,
} from 'lucide-react'

export const ADMIN_NAV = Object.freeze([
  {
    label: 'Overview',
    to: '/admin/dashboard',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'Staff',
    to: '/admin/staff',
    icon: Users,
  },
  {
    label: 'Products',
    to: '/admin/products',
    icon: Package,
  },
  {
    label: 'Plans',
    to: '/admin/plans',
    icon: Layers,
  },
  {
    label: 'Taxes',
    to: '/admin/taxes',
    icon: Percent,
  },
  {
    label: 'Discounts',
    to: '/admin/discounts',
    icon: BadgePercent,
  },
])
