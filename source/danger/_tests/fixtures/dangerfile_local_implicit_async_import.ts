declare function markdown(params: string): void

// @ts-ignore: I know what I'm doing thanks
const { hello } = await import("./returns_string")
markdown(hello)
