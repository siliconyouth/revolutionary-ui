// Mock external service-clients to avoid runtime dependencies
jest.mock('../../utils/service-clients')
import * as serviceClients from '../../utils/service-clients'
import { run } from '../../cli'

describe.skip('analyze command', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  test('logs activity and prints report', async () => {
    // Mock detector and analyzer
    const mockAnalysis = { frameworks: [] }
    const mockReport = { summary: {} }
    jest.spyOn(require('../../../src/lib/factory/project-detector'), 'ProjectDetector')
      .mockImplementation(() => ({ analyze: async () => mockAnalysis }))
    jest.spyOn(require('../../../src/lib/factory/project-analyzer'), 'ProjectAnalyzer')
      .mockImplementation(() => ({ generateReport: async () => mockReport }))

    // Mock activityLog
    const create = jest.fn().mockResolvedValue({})
    serviceClients.prisma.activityLog = { create }

    // Execute
    await run(['node', 'cli', 'analyze', '.'])
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.any(Object) }))
  })
})
