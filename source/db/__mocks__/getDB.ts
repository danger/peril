import { DatabaseAdaptor, GitHubInstallation } from ".."

// Caches per test file, so you can import it and check from the import
// If this is an issue, don't use this mock :D
let perTestFileMock: MockDB

// A set of type alias' to make the below code readable.
type NullFunc = () => Promise<void>
type InstallationIDToNullInstallation = (installationID: number) => Promise<GitHubInstallation | null>
type InstallationIDToInstallation = (installationID: number) => Promise<GitHubInstallation>
type InstallationToVoid = (installationID: number) => Promise<void>

// Take the DB and rewrite all of its functions to be both the original version and potentially the
// jest mocked version of it.
export interface MockDB extends DatabaseAdaptor {
  setup: NullFunc & jest.Mock<NullFunc>
  getInstallation: InstallationIDToNullInstallation & jest.Mock<InstallationIDToNullInstallation>
  updateInstallation: InstallationIDToNullInstallation & jest.Mock<InstallationIDToNullInstallation>
  saveInstallation: InstallationIDToInstallation & jest.Mock<InstallationIDToNullInstallation>
  deleteInstallation: InstallationToVoid & jest.Mock<InstallationToVoid>
}

// Returns a MockDB which you'll have to alias to alas, because the type system doesn't know
// that jest's mocking system will return a MockDB instead of a typical DatabaseAdaptor

export const getDB = (): MockDB => {
  if (perTestFileMock) {
    return perTestFileMock
  }

  perTestFileMock = {
    getInstallation: jest.fn(),
    deleteInstallation: jest.fn(),
    saveInstallation: jest.fn(),
    updateInstallation: jest.fn(),
    setup: jest.fn(),
  }

  return perTestFileMock
}
