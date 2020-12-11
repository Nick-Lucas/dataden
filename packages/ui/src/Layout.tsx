import { FC, useEffect } from 'react'
import { Layout as AntLayout, Menu, Typography } from 'antd'
import { useHistory } from 'react-router-dom'
import { css } from 'styled-components/macro'

export interface LayoutProps {
  title: string
  children: any
}

export const Layout: FC<LayoutProps> = ({ title, children, ...props }) => {
  const history = useHistory()

  useEffect(() => {
    const buffer = document.title
    if (title) {
      document.title = title
    }

    return () => {
      document.title = buffer
    }
  }, [title])

  return (
    <AntLayout style={{ height: '100%' }}>
      <AntLayout.Header>
        <Menu theme="dark" mode="horizontal">
          <Menu.Item onClick={() => history.push('/dashboard')}>
            Dashboard
          </Menu.Item>
          <Menu.Item onClick={() => history.push('/plugins')}>
            Plugins
          </Menu.Item>
        </Menu>
      </AntLayout.Header>

      <AntLayout.Content
        css={css`
          padding: 1rem;
        `}
        {...props}
      >
        {title && <Typography.Title>{title}</Typography.Title>}

        {children}
      </AntLayout.Content>
    </AntLayout>
  )
}
