import { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { App } from './App'

import { QueryClientProvider, QueryClient } from 'react-query'

const queryClient = new QueryClient()
function Wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

test('renders learn react link', () => {
  render(
    <Wrapper>
      <App />
    </Wrapper>
  )
  const linkElement = screen.getAllByText(/Dashboard/i)[0]
  expect(linkElement).toBeInTheDocument()
})
