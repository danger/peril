import * as express from "express"
import logger from "../logger"
import { deleteHyperImage, getAllHyperImages, updateHyperFuncImageUpdate } from "../runner/hyper-api"

// https://docs.docker.com/docker-hub/webhooks/

interface PushData {
  images: string[]
  pushed_at: number
  pusher: string
  tag: string
}

interface Repository {
  comment_count: string
  date_created: number
  description: string
  dockerfile: string
  full_description: string
  is_official: boolean
  is_private: boolean
  is_trusted: boolean
  name: string
  namespace: string
  owner: string
  repo_name: string
  repo_url: string
  star_count: number
  status: string
}

interface DockerHubWebhook {
  callback_url: string
  push_data: PushData
  repository: Repository
}

//

interface HyperImage {
  RepoTags: string[]
  Id: string
  Created: number
  Size: number
  VirtualSize: number
  Labels: {}
}

export const hyperUpdater = async (req: express.Request, res: express.Response, __: any) => {
  const webhook = req.body as DockerHubWebhook
  const image = `${webhook.repository.repo_name}:${webhook.push_data.tag}`
  res.status(200).json({ ok: true })
  logger.info("")
  logger.info("## Hyper Docker Image Updater Triggered")

  // Pulls down the new version from dockerhub
  await updateHyperFuncImageUpdate(image)
  logger.info(`   Name: ${image}`)

  // Deletes anything that's not the right tag
  const allImages: HyperImage[] = await getAllHyperImages()
  logger.info(`   ${allImages.length} images updated`)
  const notDanger = allImages.filter(i => i.RepoTags.some(t => !t.includes("danger")))
  logger.info(`   ${notDanger.length} images removed`)
  for (const iterator of notDanger) {
    try {
      // This can sometimes fail if a run is happening,
      // it can get deleted next time
      deleteHyperImage(iterator.Id)
    } catch (error) {
      // tslint:disable-next-line:
      logger.error(error.message)
    }
  }
  logger.info("")
}
