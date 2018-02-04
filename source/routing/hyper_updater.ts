import * as express from "express"
import logger from "../logger"
import { updateHyperFuncImageUpdate } from "../runner/hyper-api"

// https://docs.docker.com/docker-hub/webhooks/

export interface PushData {
  images: string[]
  pushed_at: number
  pusher: string
  tag: string
}

export interface Repository {
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

export interface DockerHubWebhook {
  callback_url: string
  push_data: PushData
  repository: Repository
}

export const hyperUpdater = async (req: express.Request, _: express.Response, __: any) => {
  const webhook = req.body as DockerHubWebhook
  const image = `${webhook.repository.repo_name}:${webhook.push_data.tag}`
  logger.info(`Updating hyper image for ${image}`)
  updateHyperFuncImageUpdate(image)
}
