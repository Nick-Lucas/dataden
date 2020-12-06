import { isSyncDue } from './isSyncDue'

describe('isSyncDue', () => {
  it('should be true for first sync', () => {
    const result = isSyncDue(
      new Date(),
      {
        success: true,
        date: new Date(0),
        latestDate: null
      },
      {
        every: 1,
        grain: 'minute'
      }
    )

    expect(result).toBe(true)
  })

  it('should be false when not enough time has passed', () => {
    const result = isSyncDue(
      new Date(2020, 5, 15, 16, 0, 59),
      {
        success: true,
        date: new Date(2020, 5, 15, 16, 0, 0),
        latestDate: null
      },
      {
        every: 1,
        grain: 'minute'
      }
    )

    expect(result).toBe(false)
  })

  it('should be true when 1 minute has passed', () => {
    const result = isSyncDue(
      new Date(2020, 5, 15, 16, 1, 0),
      {
        success: true,
        date: new Date(2020, 5, 15, 16, 0, 0),
        latestDate: null
      },
      {
        every: 1,
        grain: 'minute'
      }
    )

    expect(result).toBe(true)
  })
})
