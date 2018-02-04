// @ts-ignore
import * as fs from "fs"
import logger from "../logger"

// @ts-ignore
logger.info("0")

import * as debug from "debug"
// @ts-ignore
import * as _require from "require-from-string"
logger.info("1")
// @ts-ignore
import { DangerResults, DangerRuntimeContainer } from "danger/distribution/dsl/DangerResults"
// @ts-ignore
import { DangerContext } from "danger/distribution/runner/Dangerfile"
logger.info("2")
// @ts-ignore
import { DangerRunner } from "danger/distribution/runner/runners/runner"

logger.info("3")
import cleanDangerfile from "danger/distribution/runner/runners/utils/cleanDangerfile"
logger.info("4")
// @ts-ignore
import resultsForCaughtError from "danger/distribution/runner/runners/utils/resultsForCaughtError"
logger.info("5")
import compile from "danger/distribution/runner/runners/utils/transpiler"
logger.info("6")
import { rescheduleJob } from "node-schedule"
logger.info("8")
// @ts-ignore
const a = compile
// @ts-ignore
const b = cleanDangerfile
// @ts-ignore
const c = rescheduleJob
// @ts-ignore
const d = _require
// @ts-ignore
const e = debug
// @ts-ignore
const f = resultsForCaughtError
logger.info("10")
