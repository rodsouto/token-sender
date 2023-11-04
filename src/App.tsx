import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import TokenForm from './components/TokenForm'
import useFormSubmit from './hooks/useFormSubmit'

export function App() {
  const { isConnected } = useAccount()
  const { onFormSubmit, isSubmitting } = useFormSubmit()

  return (
    <div className="p-4">
      <ConnectButton />
      <TokenForm onFormSubmit={onFormSubmit} isSubmitting={isSubmitting} />
    </div>
  )
}
