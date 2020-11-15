import { isSyncDue } from './isSyncDue'

describe('isSyncDue', () => {
  it('should be true for first sync', () => {
    const result = isSyncDue(
      new Date(),
      {
        date: new Date(0)
      },
      {
        every: 1,
        grain: 'minute'
      }
    )

    expect(result).toBe(true)
  })

  it('should be false for the same value', () => {
    const result = isSyncDue(
      new Date(0),
      {
        date: new Date(0)
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
      new Date(0, 0, 0, 0, 1),
      {
        date: new Date(0)
      },
      {
        every: 1,
        grain: 'minute'
      }
    )

    expect(result).toBe(true)
  })
})
