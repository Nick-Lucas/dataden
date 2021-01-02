import { FC } from 'react'
import { useAuth } from 'src/queries/auth'
import { Login } from './Login'

export const AuthWrapper: FC = ({ children }) => {
  const auth = useAuth()

  if (auth.data?.username) {
    return <>{children}</>
  } else {
    return <Login />
  }
}
