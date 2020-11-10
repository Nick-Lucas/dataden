import { DataRequest, DataPayload, DataLoader, Schedule } from './interfaces'

export function createDataLoader(
  schedule: Schedule,
  loadData: (request: DataRequest) => Promise<DataPayload>
): DataLoader {
  return {
    loadData,
    schedule
  }
}
