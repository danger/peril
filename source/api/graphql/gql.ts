// This is a template string function, which returns the original string
// It's based on https://github.com/lleaff/tagged-template-noop
// Which is MIT licensed to lleaff
//

export const gql = (strings: any, ...keys: any[]) => {
  const lastIndex = strings.length - 1
  return strings.slice(0, lastIndex).reduce((p: any, s: any, i: number) => p + s + keys[i], "") + strings[lastIndex]
}
