import { DateTime, Duration } from 'luxon'

import { Schedule } from '@dataden/sdk'

import { getScoped } from 'src/logging'
const log = getScoped('IsSyncDue')

export function isSyncDue(
  now: Date,
  lastSyncISO: string,
  schedule: Schedule
): boolean {
  const nowLux = DateTime.fromJSDate(now)
  const last = DateTime.fromISO(lastSyncISO ?? new Date(0).toISOString())
  if (!last.isValid) {
    log.warn(
      `[isSyncDue]: Last Date "${lastSyncISO}" Invalid: "${last.invalidExplanation}"`
    )
    return false
  }

  const diffSinceLastSync = nowLux.diff(last)

  let frequency: Duration = null
  switch (schedule.grain) {
    case 'week':
    case 'weeks': {
      frequency = Duration.fromObject({
        days: schedule.every * 7
      })
      break
    }
    case 'day':
    case 'days': {
      frequency = Duration.fromObject({
        days: schedule.every
      })
      break
    }
    case 'hour':
    case 'hours': {
      frequency = Duration.fromObject({
        hours: schedule.every
      })
      break
    }
    case 'minute':
    case 'minutes': {
      frequency = Duration.fromObject({
        minutes: schedule.every
      })
      break
    }
    default: {
      log.error(`Unknown frequency ${JSON.stringify(schedule)}`)
      return false
    }
  }

  return frequency.as('seconds') <= diffSinceLastSync.as('seconds')
}
