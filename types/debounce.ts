import { Input } from 'tamagui'

export type DebouncedInputProps = {
    value: string
    onDebouncedChange: (val: string) => void
    delay?: number
  } & Omit<React.ComponentProps<typeof Input>, 'value'>