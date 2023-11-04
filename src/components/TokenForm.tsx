import { useAccount, useBalance, useNetwork } from 'wagmi'
import { isAddress } from 'viem'
import { useForm, SubmitHandler } from 'react-hook-form'
import useTokensByChain, { NATIVE_TOKEN, Token1Inch } from '../hooks/useTokensByChain'
import { useEffect } from 'react'
import { chains } from '../wagmi'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export type TokenFormFields = {
  amount: number
  token: `0x${string}` | ''
  recipient: `0x${string}` | ''
}

interface TokenFormProps {
  onFormSubmit: (token: Token1Inch, data: TokenFormFields) => Promise<void>
  isSubmitting: boolean
}

export default function TokenForm({ onFormSubmit, isSubmitting }: TokenFormProps) {
  const { isConnected, address } = useAccount()
  const { chain = chains[0] } = useNetwork()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TokenFormFields>({
    defaultValues: {
      amount: 0,
      token: '',
      recipient: '',
    },
  })

  const token = watch('token')

  const { data: balance } = useBalance({
    address,
    token: (token === NATIVE_TOKEN ? undefined : token) as `0x${string}`,
    chainId: chain.id,
    enabled: token !== '',
  })

  const { data: tokens = [] } = useTokensByChain(chain.id)

  useEffect(() => {
    if (tokens.length > 0) {
      // default to native token
      setValue('token', tokens.find((t) => t.tags.includes('native'))?.address || '')
    }
  }, [tokens])

  const validateAmount = (value: number) => {
    if (value <= 0) {
      return 'Amount must be greater than 0'
    }

    if (balance && Number(balance.formatted) < value) {
      return "You don't have enough balance."
    }

    return true
  }

  const validateAddress = (value: string) => isAddress(value) || 'Invalid address'

  const setMaxBalance = () => {
    if (balance) {
      setValue('amount', Number(balance?.formatted))
    }
  }

  const onSubmit: SubmitHandler<TokenFormFields> = async (data) => {
    const token = tokens.find((t) => t.address === data.token)
    await onFormSubmit(token!, data)
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="border border-[#2f333c] p-4 rounded-xl space-y-4 max-w-lg mx-auto">
        <div className="space-y-2">
          <div className="text-white font-medium">Chain</div>
          <div>{chain.name}</div>
        </div>

        <div className="space-y-2">
          <div className="text-white font-medium">Token</div>
          <div className="space-x-2 flex">
            <div className="w-1/2 space-y-2">
              <select {...register('token', { required: true })} className="select select-bordered w-full">
                {tokens.map((token) => (
                  <option value={token.address} key={token.address}>
                    {token.symbol}
                  </option>
                ))}
              </select>
              {errors.token && <div className="text-red-600">{errors.token.message || 'This field is required'}</div>}
            </div>

            <div className="w-1/2 space-y-2">
              <input
                type="number"
                {...register('amount', {
                  required: true,
                  valueAsNumber: true,
                  validate: validateAmount,
                })}
                min="0"
                step="any"
                placeholder="Amount"
                className="input input-bordered w-full"
              />
              {balance && (
                <div>
                  Balance: {Number(balance.formatted).toFixed(4)}{' '}
                  {balance.value > 0 && (
                    <span className="hover:underline cursor-pointer font-medium text-primary" onClick={setMaxBalance}>
                      Max
                    </span>
                  )}
                </div>
              )}
              {errors.amount && <div className="text-red-600">{errors.amount.message || 'This field is required'}</div>}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-white font-medium">Recipient</div>
          <div>
            <input
              type="text"
              {...register('recipient', {
                required: true,
                validate: validateAddress,
              })}
              placeholder="Address"
              className="input input-bordered w-full"
            />
          </div>
          {errors.recipient && <div className="text-red-600">{errors.recipient.message || 'This field is required'}</div>}
        </div>

        <div className="space-y-2">
          {isConnected ? (
            <button className="btn w-full" type="submit" disabled={isSubmitting || Object.keys(errors).length > 0}>
              Send
            </button>
          ) : (
            <button className="btn w-full" disabled={true}>
              Connect your wallet to use the app
            </button>
          )}
        </div>
      </form>
      <ToastContainer position="top-right" autoClose={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable={false} theme="dark" />
    </>
  )
}
