import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type ToastFn = (message: string) => void
const ToastContext = createContext<ToastFn>(() => {})
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; message: string }[]>([])
  const seq = useRef(0)

  const toast = useCallback<ToastFn>((message) => {
    const id = ++seq.current
    setItems((list) => [...list.slice(-2), { id, message }])
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 4200)
  }, [])

  const value = useMemo(() => toast, [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4 pt-[calc(env(safe-area-inset-top)+3.9rem)]">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className="glass max-w-sm rounded-full px-5 py-2.5 text-center text-sm text-ink shadow-[0_8px_40px_rgba(255,107,139,.18)]"
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
