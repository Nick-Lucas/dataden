import { FC } from 'react'
import { useAuth } from 'src/queries/auth'
import { Login } from './Login'
import * as icons from '@ant-design/icons'
import * as colors from '@ant-design/colors'

export const AuthWrapper: FC = ({ children }) => {
  const auth = useAuth()

  if (auth.isFetching && !auth.isFetched) {
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

  if (auth.data?.username) {
    return <>{children}</>
  } else {
    return <Login />
  }
}
