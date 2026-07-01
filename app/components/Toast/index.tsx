import { toast as toasts, ToastOptions, TypeOptions } from 'react-toastify'
import Image from 'next/image'

import SuccessIcon from '../../../public/icons/success-toast.svg'
import ErrorIcon from '../../../public/icons/error-toast.svg'
import InfoIcon from '../../../public/icons/info-toast.svg'
import WarningIcon from '../../../public/icons/warning-toast.svg'
import ToastBody from '../ToastBody'

const icon = {
  success: SuccessIcon,
  error: ErrorIcon,
  info: InfoIcon,
  warning: WarningIcon,
}

export default function toast(
  type: TypeOptions,
  title: string,
  description: string,
  options?: ToastOptions,
) {
  toasts(<ToastBody title={title} description={description} />, {
    type,
    icon: <Image src={icon[type]} alt={type} />,
    autoClose: options?.autoClose || 5000,
    position: 'top-right',
    ...options,
  })
}

export const Toast = {
  success(title: string, description: string, options?: ToastOptions) {
    toast('success', title, description, options)
  },
  error(title: string, description: string, options?: ToastOptions) {
    toast('error', title, description, options)
  },
  info(title: string, description: string, options?: ToastOptions) {
    toast('info', title, description, options)
  },
  warning(title: string, description: string, options?: ToastOptions) {
    toast('warning', title, description, options)
  },
}
