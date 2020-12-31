import { Registry } from 'src/lib/PluginManager'

export namespace GetRegistry {
  export const path = '/v1.0/registry'

  export type Response = Registry
}
