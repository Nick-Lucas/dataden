import { FC, useEffect } from 'react'
import { Layout as AntLayout, Menu, Typography } from 'antd'
import { useHistory } from 'react-router-dom'
import styled, { css } from 'styled-components/macro'

export interface LayoutProps {
  title?: string
  children: any
  limitWidth?: boolean
}

export const Layout: FC<LayoutProps> = ({
  title,
  children,
  limitWidth = false,
  ...props
}) => {
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
    <AntLayout style={{ height: '100%', overflow: 'auto' }}>
      <AntLayout.Header>
        <Menu theme="dark" mode="horizontal">
          <Menu.Item onClick={() => history.push('/dashboard')}>
            Dashboard
          </Menu.Item>
          <Menu.Item onClick={() => history.push('/plugins')}>
            Installed Plugins
          </Menu.Item>
        </Menu>
      </AntLayout.Header>

      <AntLayout.Content
        css={css`
          padding: 1rem;

          align-self: center;
          width: ${limitWidth ? '50rem' : '100%'};
        `}
        {...props}
      >
        {title && <Typography.Title level={2}>{title}</Typography.Title>}

        {children}
      </AntLayout.Content>
    </AntLayout>
  )
}

export const ContentCard = styled.div`
  padding: 0.5rem 1rem;
  background-color: white;

  box-shadow: 0px 2px 3px 0px gray;
`
