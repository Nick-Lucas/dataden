jest.mock('../src/logging')
jest.mock('../src/db/getClient')

jest.setTimeout(30000)

// Stub out env
process.env.PORT = -1
process.env.MONGO_URI =
  'mongodb://test:testpw@localhost:27018?retryWrites=true&w=majority'

const getClientMock = require('../src/db/__mocks__/getClient')

beforeEach(async () => {
  await getClientMock.wipeDb()
})
