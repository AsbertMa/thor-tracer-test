import { Analyze } from 'thor-tracer'
import { expect } from 'chai'
import { Framework } from '@vechain/connex-framework'
import { SimpleNet, Driver } from '@vechain/connex.driver-nodejs'

interface Global extends NodeJS.Global {
  connex: Connex
}

declare var global: Global

const BLOCK_ID = '0x0036d78c68f63447a69d8f72e590dca4aa7061fd9781c46032ffb7124ff4d024'

describe('Analyze', () => {
  before(async () => {
    const driver = await Driver.connect(new SimpleNet('https://sync-testnet.vechain.org', 10000))
    global.connex = new Framework(driver)
  })

  it('Default opts get all events and transfers in the block', (done) => {
    const analyze = new Analyze({
      filter: {}
    }, connex)

    analyze.block(BLOCK_ID)
      .then((result: Analyze.blockResult | null) => {
        expect(result).to.have.keys(['blockId', 'events', 'transfers'])
        expect(result!.events.length).to.be.equal(2)
        expect(result!.transfers.length).to.be.equal(1)
        done()
      }).catch(e => {
        done(e)
      })
  })


  it('Close transfer and event filter the result should be null', (done) => {
    const analyze = new Analyze({
      filter: {
        transfer: false,
        event: false,
        address: ['0xAa7E4FE8F0AF2930acd3eC9689eC6e23d974584A'],
        contracts: ['0x0000000000000000000000000000456E65726779']
      }
    }, connex)

    analyze.block(BLOCK_ID).then((result: Analyze.blockResult | null) => {
      expect(result).to.have.keys(['blockId', 'events', 'transfers'])
      expect(result!.events.length).to.be.equal(0)
      expect(result!.transfers.length).to.be.equal(0)
      done()
    }).catch(e => {
      done(e)
    })
  })

  it('Filter by address, should have match result', (done) => {
    const analyze = new Analyze({
      filter: {
        address: ['0xaa7e4fe8f0af2930acd3ec9689ec6e23d974584a'],
        contracts: ['0x0000000000000000000000000000456e65726779']
      }
    }, connex)

    analyze.block(BLOCK_ID).then((result: Analyze.blockResult | null) => {
      expect(result).to.have.keys(['blockId', 'events', 'transfers'])
      expect(result!.events.length).to.be.equal(1)
      expect(result!.events[0].address).to.be.eq('0x0000000000000000000000000000456e65726779')
      expect(result!.transfers.length).to.be.equal(1)
      expect(result!.transfers[0].sender).to.be.eq('0xaa7e4fe8f0af2930acd3ec9689ec6e23d974584a')
      expect(result!.transfers[0].recipient).to.be.equal('0xd015d91b42bed5feaf242082b11b83b431abbf4f')
      done()
    }).catch(e => {
      done(e)
    })
  })

  it('Filter by address, should have match result', (done) => {
    const analyze = new Analyze({
      filter: {
        address: ['0xd015d91b42bed5feaf242082b11b83b431abbf4f'],
        contracts: ['0xd015d91b42bed5feaf242082b11b83b431abbf4f']
      }
    }, connex)

    analyze.block(BLOCK_ID).then((result: Analyze.blockResult | null) => {
      expect(result).to.have.keys(['blockId', 'events', 'transfers'])
      expect(result!.events.length).to.be.equal(1)
      expect(result!.events[0].address).to.be.eq('0xd015d91b42bed5feaf242082b11b83b431abbf4f')
      expect(result!.transfers.length).to.be.equal(1)
      expect(result!.transfers[0].sender).to.be.eq('0xaa7e4fe8f0af2930acd3ec9689ec6e23d974584a')
      expect(result!.transfers[0].recipient).to.be.equal('0xd015d91b42bed5feaf242082b11b83b431abbf4f')
      done()
    }).catch(e => {
      done(e)
    })
  })

  it('Filter by custom filter function, should have match result', (done) => {
    const analyze = new Analyze(
      {
        filter: {},
        eventFilter: (item): boolean => {
          return item.address === '0x0000000000000000000000000000456e65726779'
        },
        transferFilter: (item): boolean => {
          return item.recipient === '0xd015d91b42bed5feaf242082b11b83b431abbf4f'
        }
      },
      connex
    )

    analyze.block(BLOCK_ID).then((result: Analyze.blockResult | null) => {
      expect(result).to.have.keys(['blockId', 'events', 'transfers'])
      expect(result!.events.length).to.be.equal(1, 'events.length === 1')
      expect(result!.events[0].address).to.be.eq('0x0000000000000000000000000000456e65726779')
      expect(result!.transfers.length).to.be.equal(1,'transfers.length === 1')
      done()
    }).catch(e => {
      done(e)
    })
  })
})
