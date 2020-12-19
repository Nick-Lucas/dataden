import { DateTime, Duration } from 'luxon'

import { Schedule, SyncInfo } from '@mydata/sdk'

export function isSyncDue(
  now: Date,
  lastSync: SyncInfo,
  schedule: Schedule
): boolean {
  const nowLux = DateTime.fromJSDate(now)
  const last = DateTime.fromISO(lastSync.date ?? new Date(0).toISOString())

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
      console.error(`Unknown frequency ${JSON.stringify(schedule)}`)
      return false
    }
  }

  return frequency.as('seconds') <= diffSinceLastSync.as('seconds')
}
