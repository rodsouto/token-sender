import { useQuery } from '@tanstack/react-query'

export const NATIVE_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export interface Token1Inch {
  symbol: string
  name: string
  decimals: number
  address: `0x${string}`
  tags: string[]
}

export default function useTokensByChain(chainId: number) {
  return useQuery<Token1Inch[], Error>(
    ['useTokensByChain', chainId],
    async (): Promise<Token1Inch[]> => {
      if (!chainId) {
        return []
      }

      try {
        const response = await fetch(`https://tokens.1inch.io/v1.1/${chainId}`)

        if (response.status !== 200) {
          return []
        }

        const tokens = await response.json()

        return Object.values(tokens)
      } catch {
        return []
      }
    },
    {
      staleTime: 60 * 10 * 1000,
    }
  )
}
