export interface DataRow extends Record<string, unknown> {
  uniqueId
}

export interface DataRequest {
  lastDate: Date
  settings: Record<string, string>
}

export interface DataPayload {
  mode: 'append' | 'replace'
  data: DataRow[]
  lastDate: Date
}

export interface Schedule {
  every: number
  grain:
    | 'minutes'
    | 'minute'
    | 'hours'
    | 'hour'
    | 'days'
    | 'day'
    | 'weeks'
    | 'week'
}

export interface DataLoader {
  loadData: (request: DataRequest) => Promise<DataPayload>
  schedule: Schedule
}
