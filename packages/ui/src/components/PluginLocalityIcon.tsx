import { FC } from 'react'
import { Tooltip } from 'antd'
import * as icons from '@ant-design/icons'

interface PluginProps {
  local: boolean
}

export const PluginLocalityIcon: FC<PluginProps> = ({ local }) => {
  return local ? (
    <Tooltip title="Installed locally">
      <icons.HomeOutlined />
    </Tooltip>
  ) : (
    <Tooltip title="Installed from registry">
      <icons.ApiOutlined />
    </Tooltip>
  )
}
