import { Schedule, SyncInfo } from '@mydata/sdk'

export function isSyncDue(
  now: Date,
  lastSync: SyncInfo,
  schedule: Schedule
): boolean {
  const last = new Date(lastSync.date)

  const difference = new Date(now.valueOf() - last.valueOf())

  let minDifference = null
  switch (schedule.grain) {
    case 'week':
    case 'weeks': {
      minDifference = new Date(0, 0, schedule.every * 7)
      break
    }
    case 'day':
    case 'days': {
      minDifference = new Date(0, 0, schedule.every)
      break
    }
    case 'hour':
    case 'hours': {
      minDifference = new Date(0, 0, 0, schedule.every)
      break
    }
    case 'minute':
    case 'minutes': {
      minDifference = new Date(0, 0, 0, 0, schedule.every)
      break
    }
  }

  return minDifference <= difference
}
