import { http, createConfig } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [polygon],
  connectors: [
    injected(),
    // Replace with your own project ID from https://cloud.walletconnect.com
    // walletConnect({ projectId: 'YOUR_PROJECT_ID' }),
    // coinbaseWallet({ appName: 'b2b-leads' }),
  ],
  transports: {
    [polygon.id]: http(),
  },
})
