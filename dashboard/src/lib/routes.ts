const thisServer = process.env.REACT_APP_PUBLIC_WEB_ROOT_URL
const api = process.env.REACT_APP_PUBLIC_API_ROOT_URL

/** URL to the main dashboard */
export const successfulLoginURL = thisServer + "/success"
/** URL send someone to log into Peril */
export const loginURL = api + "/api/auth/peril/github/start?redirect=" + encodeURIComponent(successfulLoginURL)
/** URL to an partial installation */
export const partialInstallation = (iID: number) => thisServer + "/partial/" + iID
/** When you want to send someone somewhere nice */
export const customLoginRedirect = (url: string) =>
  api + "/api/auth/peril/github/start?redirect=" + encodeURIComponent(url)
/** URL to add Peril to an org */
export const addPerilURL = api + "/api/integrate/github"
