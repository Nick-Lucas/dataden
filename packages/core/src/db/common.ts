export const DATABASES = {
  CORE: 'core',
  PLUGIN_PREFIX: 'plugin__',
  DATA: 'data'
}

export const COLLECTIONS = {
  [DATABASES.CORE]: {
    PLUGINS: 'plugins',
    USERS: 'users',
    AGGREGATIONS: 'aggregations'
  }
}

export interface PagingPosition {
  page: number
}

export interface PagingResult<T> {
  page: number
  pages: number
  data: T[]
}
