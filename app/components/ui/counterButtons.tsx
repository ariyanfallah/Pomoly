// app/components/ui/counterButtons.tsx
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
  return (
    <div className={`w-48 h-10 border border-border rounded-xl overflow-hidden`}>
      <ButtonGroup
        orientation="horizontal"
        aria-label="Counter"
        className="w-full h-full items-stretch"
      >

      <Button
          variant="outline"
          className="h-full w-7 sm:w-8 border-none shrink-0 [&_svg]:size-3 bg-background p-0 rounded-l-xl rounded-r-none"
          onClick={onDecrement}
        >
          <MinusIcon />
        </Button>

        <div className="flex-1 flex items-center justify-center min-w-0">
          {children}
        </div>

        <Button
          variant="outline"
          className="h-full w-7 sm:w-8 shrink-0 [&_svg]:size-3 bg-background p-0 rounded-r-xl rounded-l-none"
          onClick={onIncrement}
        >
          <PlusIcon />
        </Button>
      </ButtonGroup>
    </div>
  )
}
export default CounterButtons