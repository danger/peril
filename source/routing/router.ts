import * as winston from "winston"

import {createInstallation} from "../github/events/create_installation"
import {ping} from "../github/events/ping"
import {pullRequest} from "../github/events/pull_request"

import { RootObject as InstallationCreated } from "../github/events/types/integration_installation_created.types"
import { RootObject as PR } from "../github/events/types/pull_request_opened.types"

const router = (req, res, next) => {
  const event = req.header("X-GitHub-Event")
  winston.log("router", `Recieved ${event}:`)

  githubRouting(event, req, res)
  next()
}

export const githubRouting = (event, req, res) => {
  switch (event) {
    case "ping": {
      ping(req, res)
      break
    }

    case "integration_installation": {
      const request = req.body as InstallationCreated
      const action = request.action

      if (action === "created") {
        winston.log("router", ` ${request.action} on ${request.sender}`)
        createInstallation(request.installation, req, res)
      }
      break
    }

    case "pull_request": {
      const request = req.body as PR
      winston.log("router", ` ${request.action} on ${request.repository.full_name}`)
      pullRequest(request, req, res)
      break
    }

    default: {
      winston.log("router", ` unhandled - 404ing`)
      res.status(404).send("Yo, this ain't done yet")
    }
  }
}

export default router
