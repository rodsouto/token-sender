import { toast } from 'react-toastify'
import { BroadcastData } from '../hooks/useFormSubmit'

export function showToast(broadcastData: BroadcastData) {
  const TYPES = {
    pending: toast.TYPE.INFO,
    success: toast.TYPE.SUCCESS,
    error: toast.TYPE.ERROR,
    info: toast.TYPE.INFO,
  }

  const options = {
    type: TYPES[broadcastData.type],
    isLoading: broadcastData.type === 'pending',
    closeButton: true,
  }

  if (toast.isActive(broadcastData.toastId)) {
    toast.update(broadcastData.toastId, {
      render: broadcastData.message,
      ...options,
    })
  } else {
    toast(broadcastData.message, {
      toastId: broadcastData.toastId,
      ...options,
    })
  }
}
