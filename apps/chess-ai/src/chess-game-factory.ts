import {
  GameCreated as GameCreatedEvent
} from "../generated/ChessGameFactory/ChessGameFactory"
import {
  GameCreated
} from "../generated/schema"


export function handleCreateGame(event: GameCreatedEvent): void {
  let entity = new GameCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.gameAddress = event.params.gameAddress
  entity.whitePlayer = event.params.whitePlayer
  entity.blackPlayer = event.params.blackPlayer
  entity.configId = event.params.configId

  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}