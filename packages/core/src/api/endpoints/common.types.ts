export namespace Common {
  export interface PluginParams {
    pluginId: string
  }

  export interface PluginInstanceParams extends PluginParams {
    instanceId: string
  }
}

export type MaybeError<T> = T | string
