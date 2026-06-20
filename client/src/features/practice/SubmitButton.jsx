// SubmitButton — Submit and grade action button

import Button from '../../components/ui/Button'

export default function SubmitButton({ onClick, loading, disabled }) {
  return (
    <Button
      variant="primary"
      size="lg"
      onClick={onClick}
      loading={loading}
      disabled={disabled}
    >
      Submit & Grade ✨
    </Button>
  )
}
