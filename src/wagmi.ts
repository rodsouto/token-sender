import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig } from 'wagmi'
import { goerli, mainnet, arbitrum, optimism, gnosis } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'

const walletConnectProjectId = 'fc759beda791e89713da31d2d1b1c07d'
const alchemyApiKey = '7jikbZGjDnt-6nZ3PVqjKWajj-UiaIYz'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, arbitrum, optimism, gnosis, ...(import.meta.env?.MODE === 'development' ? [goerli] : [])],
  [alchemyProvider({ apiKey: alchemyApiKey }), publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'Token Sender',
  chains,
  projectId: walletConnectProjectId,
})

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export { chains }
