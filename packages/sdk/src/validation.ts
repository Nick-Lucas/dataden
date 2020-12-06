import { PluginService } from './PluginInstance'

export function pluginInstanceIsValid(instance: PluginService) {
  if (!instance) {
    console.warn('Plugin instance is nully')
    return false
  }

  if (!Array.isArray(instance.loaders)) {
    console.warn('Plugin instance does not have an array of loaders.')
    return false
  }

  if (!instance.loaders.length) {
    console.warn('Plugin instance does not have any loaders.')
    return false
  }

  if (
    !instance.loaders.every(
      (loader) => loader.name?.length > 0 && typeof loader.load === 'function'
    )
  ) {
    console.warn('Plugin instance loaders are invalid')
    return false
  }

  return true
}

const nameRegex = /^[\d\w_]+$/
export function nameIsValid(name: string) {
  if (!name || !name.length) {
    return false
  }

  return nameRegex.test(name)
}
