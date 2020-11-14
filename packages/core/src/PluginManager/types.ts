export interface RegistryPlugin {
  id: string
  version: number
  name: string
  description: string
  source: string
  verified: boolean
}

export interface Registry {
  list: RegistryPlugin[]
}
