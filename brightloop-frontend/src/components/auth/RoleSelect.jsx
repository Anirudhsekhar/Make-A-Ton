import { ShieldCheck } from 'lucide-react'
import { ROLE_OPTIONS } from '../../config/roles'
import SelectField from './SelectField'

export default function RoleSelect({
  id = 'role',
  label = 'Sign in as',
  value,
  onChange,
  error,
  hint = 'Your role is verified against your trusted account profile after sign-in.',
  disabled = false,
  required = false,
}) {
  return (
    <SelectField
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      hint={hint}
      icon={ShieldCheck}
      options={ROLE_OPTIONS}
      placeholder="Select your role"
      disabled={disabled}
      required={required}
    />
  )
}
