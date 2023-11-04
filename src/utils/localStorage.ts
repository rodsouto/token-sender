import { BroadcastData } from '../hooks/useFormSubmit'

const LOCAL_KEY = 'TX_DATA'

export function getLocalStorageTxs() {
  return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') as Record<string, BroadcastData>
}

export function addLocalStorageTx(broadcastData: BroadcastData) {
  const localData = getLocalStorageTxs()

  localData[broadcastData.toastId] = broadcastData

  localStorage.setItem(LOCAL_KEY, JSON.stringify(localData))
}

export function removeLocalStorageTx(broadcastData: BroadcastData) {
  const localData = getLocalStorageTxs()

  delete localData[broadcastData.toastId]

  localStorage.setItem(LOCAL_KEY, JSON.stringify(localData))
}
