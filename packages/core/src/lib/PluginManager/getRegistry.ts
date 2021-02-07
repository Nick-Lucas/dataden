import axios, { AxiosResponse } from 'axios'

import { Registry } from './types'

const REGISTRY_URI =
  'https://raw.githubusercontent.com/Nick-Lucas/dataden/master/meta/registry.json'

export async function getRegistry(): Promise<AxiosResponse<Registry>> {
  return await axios.get<Registry>(REGISTRY_URI, {
    validateStatus: (status) => status === 200
  })
}
