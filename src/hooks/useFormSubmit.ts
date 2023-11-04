import { sendTransaction, waitForTransaction, writeContract, erc20ABI } from '@wagmi/core'
import { parseUnits } from 'viem'
import { useBroadcastChannel } from './useBroadcastChannel'
import { TokenFormFields } from '../components/TokenForm'
import { toast } from 'react-toastify'
import { Token1Inch } from './useTokensByChain'
import { useEffect, useState } from 'react'
import { addLocalStorageTx, getLocalStorageTxs } from '../utils/localStorage'
import { showToast } from '../utils/toast'

function shortAddress(address: `0x${string}`) {
  return address.substr(0, 4) + '...' + address.substr(-4)
}

export interface BroadcastData {
  type: 'pending' | 'success' | 'error' | 'info'
  message: string
  toastId: string
}

export default function useFormSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* BROADCAST MESSAGES TO OTHER TABS */
  const broadcastNotification = useBroadcastChannel('token-form-notification', (e: MessageEvent) => {
    const broadcastData = JSON.parse(e.data) as BroadcastData

    addLocalStorageTx(broadcastData)
    showToast(broadcastData)
  })

  /* LOAD STATE FROM LOCAL STORAGE */
  useEffect(() => {
    const localData = getLocalStorageTxs()

    Object.values(localData).forEach((broadcastData) => showToast(broadcastData))
  }, [])

  /* SEND TOKENS */
  const onFormSubmit = async (token: Token1Inch, data: TokenFormFields) => {
    const isNativeToken = token?.tags.includes('native')

    let hash: `0x${string}` | '' = ''

    setIsSubmitting(true)

    try {
      ;({ hash } = isNativeToken
        ? await sendTransaction({
            to: data.recipient,
            value: parseUnits(String(data.amount) as `${number}`, token!.decimals),
          })
        : await writeContract({
            address: data.token as `0x${string}`,
            abi: erc20ABI,
            functionName: 'transfer',
            args: [data.recipient as `0x${string}`, parseUnits(String(data.amount) as `${number}`, token!.decimals)],
          }))

      /* SHOW MESSAGES IN CURRENT TAB */
      await toast.promise(
        waitForTransaction({
          hash,
          onReplaced: (replacement) => {
            /* SHOW REPLACED TX INFO */
            const message = `TX replaced, sending ${data.amount} ${token?.symbol} to ${shortAddress(data.recipient as `0x${string}`)}`
            const broadcastData: BroadcastData = {
              type: 'success',
              message,
              toastId: `replaced_${hash}`,
            }
            showToast(broadcastData)
            broadcastNotification(JSON.stringify(broadcastData))
          },
        }),
        {
          pending: {
            render() {
              const message = `Sending ${data.amount} ${token?.symbol} to ${shortAddress(data.recipient as `0x${string}`)}`
              const broadcastData: BroadcastData = {
                type: 'pending',
                message,
                toastId: hash,
              }
              broadcastNotification(JSON.stringify(broadcastData))
              return message
            },
          },
          success: {
            render() {
              const message = `Sent ${data.amount} ${token?.symbol} to ${shortAddress(data.recipient as `0x${string}`)}`
              const broadcastData: BroadcastData = {
                type: 'success',
                message,
                toastId: hash,
              }
              broadcastNotification(JSON.stringify(broadcastData))
              return message
            },
          },
          error: {
            render({ data: e }) {
              const message = (e as any).shortMessage || `Failed to send ${data.amount} ${token?.symbol} to ${shortAddress(data.recipient as `0x${string}`)}`
              const broadcastData: BroadcastData = {
                type: 'error',
                message,
                toastId: hash,
              }
              broadcastNotification(JSON.stringify(broadcastData))
              return message
            },
          },
        },
        {
          toastId: hash,
        }
      )
    } catch (e: any) {
      const message = e.shortMessage || `Failed to send ${data.amount} ${token?.symbol} to ${shortAddress(data.recipient as `0x${string}`)}`
      const broadcastData: BroadcastData = {
        type: 'error',
        message,
        toastId: hash,
      }
      showToast(broadcastData)
      broadcastNotification(JSON.stringify(broadcastData))
    }

    setIsSubmitting(false)
  }

  return {
    onFormSubmit,
    isSubmitting,
  }
}