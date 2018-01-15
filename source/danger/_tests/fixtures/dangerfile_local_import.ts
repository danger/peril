declare function markdown(params: string): void

const getAsync = async () => {
  const { hello } = await import("./returns_string")
  markdown(hello)
}

getAsync()
