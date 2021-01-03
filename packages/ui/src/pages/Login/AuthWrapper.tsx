import { FC } from 'react'
import { Layout } from 'antd'
import * as icons from '@ant-design/icons'
import * as colors from '@ant-design/colors'

import { useIsAuthenticated } from 'src/queries/auth'
import { Login } from './Login'
import { ResetPassword } from './ResetPassword'

export const AuthWrapper: FC = ({ children }) => {
  const [checked, isAuthenticated] = useIsAuthenticated()

  if (!checked) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <icons.LoadingOutlined
          style={{ fontSize: '20vh', color: colors.blue.primary }}
          spin
        />
      </div>
    )
  }

  if (isAuthenticated === 'reset-password') {
    return <ResetPassword />
  }

  if (isAuthenticated === false) {
    return <Login />
  }

  return <Layout>{children}</Layout>
}
