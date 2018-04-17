process.env.NODE_ENV = 'test'

const assert = require('assert')
const {Game, GameState, GameFinishStatus, GAME_TIMEOUT} = require('../src/game')
const Workspace = require('../src/workspace')
const {WebClient} = require('../src/mock-slack-client')

const TIMEOUT_THRESHOLD = 1.2

describe('Game', function () {
  const workspace = new Workspace('123')
  workspace.messenger.setWebClient(new WebClient())

  it('should have initial configurations set at start', async function () {
    const channelId = 'fake'
    const onGameFinished = () => {
    }

    const game = new Game(workspace, channelId, onGameFinished)
    await game.start()

    assert.deepStrictEqual(game.messenger, workspace.messenger)
    assert.strictEqual(game.getChannelId(), channelId)
    assert.deepStrictEqual(game.getAnswers(), {})
    assert.strictEqual(game.getState(), GameState.STARTED)
    assert.strictEqual(game.getFinishStatus(), GameFinishStatus.NOT_ENOUGH_PLAYERS)
    assert.strictEqual(game.onGameFinished, onGameFinished)
  })

  describe('logic', function () {
    it('should call \'onGameFinished\' after GAME_TIMEOUT', async function () {
      const game = new Game(workspace)
      await game.start()

      this.timeout(GAME_TIMEOUT * TIMEOUT_THRESHOLD)

      return game.onGameFinished
    })

    it('should have \'finishStatus\' equal to \'NOT_ENOUGH_PLAYERS\' if no one joins', async function () {
      const onGameFinished = (game) => {
        assert.strictEqual(game.getFinishStatus(), GameFinishStatus.NOT_ENOUGH_PLAYERS)
      }

      const game = new Game(workspace, 'fake', onGameFinished)
      await game.start()

      this.timeout(GAME_TIMEOUT * TIMEOUT_THRESHOLD)

      return onGameFinished
    })

    it('should report correct winner when only two exist', async function () {
      const game = new Game(workspace)
      await game.start()

      const winnerId = 'winner'
      const loserId = 'loser'

      const price = game.getProduct().price

      game.handleEvent(winnerId, (price - 1).toString())
      game.handleEvent(loserId, (price - 2).toString())

      game.finish()

      assert.strictEqual(game.getWinner(), winnerId)
      assert.strictEqual(game.getState(), GameState.FINISHED)
      assert.strictEqual(game.getFinishStatus(), GameFinishStatus.WINNER)
    })

    it('should report correct winner when only two exist (even if price is exact)', async function () {
      const game = new Game(workspace)
      await game.start()

      const winnerId = 'winner'
      const loserId = 'loser'

      const price = game.getProduct().price

      game.handleEvent(winnerId, (price).toString())
      game.handleEvent(loserId, (price - 1).toString())

      game.finish()

      assert.strictEqual(game.getWinner(), winnerId)
      assert.strictEqual(game.getState(), GameState.FINISHED)
      assert.strictEqual(game.getFinishStatus(), GameFinishStatus.WINNER)
    })

    it('should report no winner when there isn\'t any', async function () {
      const game = new Game(workspace)
      await game.start()

      const overpricedId1 = 'overpriced1'
      const overpricedId2 = 'overpriced2'

      const price = game.getProduct().price

      game.handleEvent(overpricedId1, (price + 1).toString())
      game.handleEvent(overpricedId2, (price + 2).toString())

      game.finish()

      assert.strictEqual(game.getWinner(), undefined)
      assert.strictEqual(game.getState(), GameState.FINISHED)
      assert.strictEqual(game.getFinishStatus(), GameFinishStatus.DRAW)
    })

    it('should report not enough players when there are less than two', async function () {
      const game = new Game(workspace)
      await game.start()
      const lonelyId = 'lonely'

      const price = game.getProduct().price

      game.handleEvent(lonelyId, (price - 1).toString())
      game.finish()

      assert.strictEqual(game.getWinner(), undefined)
      assert.strictEqual(game.getState(), GameState.FINISHED)
      assert.strictEqual(game.getFinishStatus(), GameFinishStatus.NOT_ENOUGH_PLAYERS)
    })
  })

  describe('message handler', function () {
    it('should discard non-positive values as answer', async function () {
      const game = new Game(workspace)
      await game.start()

      game.handleEvent('fake1', '-3')
      game.handleEvent('fake2', '0')

      assert.strictEqual(Object.entries(game.getAnswers()).length, 0)
    })

    it('should discard invalid values as answer', async function () {
      const game = new Game(workspace)
      await game.start()

      game.handleEvent('fake1', '{}')
      game.handleEvent('fake2', '![]')

      assert.strictEqual(Object.entries(game.getAnswers()).length, 0)
    })

    it('should accept integer values as answer', async function () {
      const userId = 'fake'
      const game = new Game(workspace)
      await game.start()

      game.handleEvent(userId, '3')

      assert.strictEqual(game.getAnswers()[userId], 3)
    })

    it('should accept decimal values as answer', async function () {
      const userId1 = 'fake1'
      const userId2 = 'fake2'
      const game = new Game(workspace)
      await game.start()

      game.handleEvent(userId1, '5,5')
      assert.strictEqual(game.getAnswers()[userId1], 5.5)

      game.handleEvent(userId2, '3.5')
      assert.strictEqual(game.getAnswers()[userId2], 3.5)
    })
  })
})
