// Mock service-client implementations to avoid external dependencies
jest.mock('../service-clients')
import * as serviceClients from '../service-clients'
import { listComponents, getComponent } from '../data-access'

describe.skip('data-access utilities', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  test('listComponents uses Redis cache if available', async () => {
    const mockData = [{ id: '1', name: 'Comp1', framework: 'React', componentType: 'button' }]
    ;(serviceClients.redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockData))
    const result = await listComponents({ search: 'Comp1' })
    expect(serviceClients.redis.get).toHaveBeenCalled()
    expect(result).toEqual(mockData)
  })

  test('getComponent returns Prisma findUnique result', async () => {
    const mockComp = { id: '42', name: 'TestComp' }
    ;(serviceClients.prisma.component.findUnique as jest.Mock).mockResolvedValue(mockComp)
    const result = await getComponent('42')
    expect(serviceClients.prisma.component.findUnique).toHaveBeenCalledWith({ where: { id: '42' } })
    expect(result).toEqual(mockComp)
  })
})
