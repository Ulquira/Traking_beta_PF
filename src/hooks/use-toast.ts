import { useState } from "react"

export interface Toast {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (props: Toast) => {
    setToasts((prev) => [...prev, props])
    // Un simple alert para visualizar la notificación en caso de no tener el componente Toast completo de shadcn
    alert(`${props.title}: ${props.description}`)
  }

  return { toast, toasts }
}