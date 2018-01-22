declare function markdown(params: string): void

// @ts-ignore
const { hello } = await import("./returns_string")
markdown(hello)
