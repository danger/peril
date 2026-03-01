import { getDB } from "../../../db/getDB"
import { MongoDB } from "../../../db/mongo"
import { getDetailsFromPerilJWT } from "../../auth/generate"

export const getUserInstallations = async (jwt: string) => {
  const decodedJWT = await getDetailsFromPerilJWT(jwt)
  const db = getDB() as MongoDB
  return await db.getInstallations(decodedJWT.iss.map(i => parseInt(i, 10)))
}
