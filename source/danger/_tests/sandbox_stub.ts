export const stubSandbox = () =>
  ({ danger: { github: { pr: { head: { ref: "ace123", repo: { full_name: "hi/hi" } } } } } } as any)
