// app/components/ui/counterButtons.tsx
import { useState, useEffect, useRef } from "react"
import { MinusIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

type Props = {
  children: React.ReactNode 
  onIncrement?: () => void
  onDecrement?: () => void
  className?: string
}

export function CounterButtons({ children, onIncrement, onDecrement }: Props) {
  const [isDecrementing, setIsDecrementing] = useState(false)
  const [isIncrementing, setIsIncrementing] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (isDecrementing && onDecrement) {
      intervalRef.current = setInterval(() => {
        onDecrement()
      }, 100)
    } else if (isIncrementing && onIncrement) {
      intervalRef.current = setInterval(() => {
        onIncrement()
      }, 100)
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isDecrementing, isIncrementing, onDecrement, onIncrement])

  const handleDecrementStart = () => {
    if (onDecrement) {
      onDecrement() // Immediate first call
      setIsDecrementing(true)
    }
  }

  const handleIncrementStart = () => {
    if (onIncrement) {
      onIncrement() // Immediate first call
      setIsIncrementing(true)
    }
  }

  const handleStop = () => {
    setIsDecrementing(false)
    setIsIncrementing(false)
  }

  return (
    <div className={`w-26 h-10 border border-border rounded-xl overflow-hidden`}>
      <ButtonGroup
        orientation="horizontal"
        aria-label="Counter"
        className="w-full h-full items-stretch"
      >

      <Button
          variant="outline"
          className=" h-full w-[20%] border-none shrink-0 [&_svg]:size-3 bg-background p-0 rounded-r-xl px-2 rounded-l-none"
          onMouseDown={handleDecrementStart}
          onMouseUp={handleStop}
          onMouseLeave={handleStop}
        >
          <MinusIcon />
        </Button>

        <div className=" w-[60%] flex items-center justify-center min-w-0">
          {children}
        </div>

        <Button
          variant="outline"
          className=" h-full w-[20%] border-none shrink-0 [&_svg]:size-3 bg-background p-0 rounded-r-xl px-2 rounded-l-none"
          onMouseDown={handleIncrementStart}
          onMouseUp={handleStop}
          onMouseLeave={handleStop}
        >
          <PlusIcon />
        </Button>
      </ButtonGroup>
    </div>
  )
}
export default CounterButtons