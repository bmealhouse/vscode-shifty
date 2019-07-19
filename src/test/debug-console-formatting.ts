function format(formatCode: string) {
  return (text: string): string => `\u001B[${formatCode}m${text}\u001B[0m`
}

export const bold = format('1')
export const black = format('30')
export const red = format('31')
export const green = format('32')
export const yellow = format('33')
export const purple = format('35')
export const redBg = format('41')
export const greenBg = format('42')
export const darkGray = format('90')
export const white = format('97')
