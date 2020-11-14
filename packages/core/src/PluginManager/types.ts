export interface RegistryPlugin {
  id: string
  version: number
  name: string
  description: string
  source: string
  verified: boolean
  local: false
}

export interface LocalPlugin {
  id: string
  name: string
  description: string
  source: string
  local: true
}

export interface Registry {
  list: RegistryPlugin[]
}
