export interface RepresentationForURL {
  /** The path the the file aka folder/file.ts  */
  dangerfilePath: string
  /** The branch to find the dangerfile on  */
  branch: string
  /** An optional repo */
  repoSlug: string | undefined
  /** The original full string, with repo etc  */
  referenceString: string
}

/** Takes a DangerfileReferenceString and lets you know where to find it globally */
export const dangerRepresentationForPath = (value: string): RepresentationForURL => {
  const afterAt = value.includes("@") ? value.split("@")[1] : value
  return {
    branch: value.includes("#") ? value.split("#")[1] : "master",
    dangerfilePath: afterAt.split("#")[0],
    repoSlug: value.includes("@") ? value.split("@")[0] : undefined,
    referenceString: value,
  }
}

/**
 * From: danger/peril-settings@settings.json
 * To: https://github.com/danger/peril-settings/blob/master/settings.json
 */
export const githubURLForReference = (value: string, repo?: string) => {
  const rep = dangerRepresentationForPath(value)
  const repoSlug = rep.repoSlug || repo
  if (!repoSlug) {
    throw new Error("no repo found")
  }

  return `https://github.com/${repoSlug}/blob/${rep.branch}/${rep.dangerfilePath}`
}
