import { nameIsValid } from './validation'

describe('validation', () => {
  describe('nameIsValid', () => {
    it('should validate valid name', () => {
      expect(nameIsValid('IAm_Valid123')).toBe(true)
    })

    it('should validate invalid name', () => {
      expect(nameIsValid('IA-m_Valid')).toBe(false)
    })

    it('should validate invalid name', () => {
      expect(nameIsValid('IA m_Valid')).toBe(false)
    })
  })
})
