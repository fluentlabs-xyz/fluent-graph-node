import { BigDecimal } from "@graphprotocol/graph-ts";
import {
  GameFinished,
  MoveMade,
  GameCreated,
  ChessGame
} from "../generated/ChessGame/ChessGame"
import {
  Game,
  Move,
  Player
} from "../generated/schema"

function getOrCreatePlayer(id: string): Player {
  let player = Player.load(id);
  if (!player) {
    player = new Player(id);
    player.gamesPlayed = 0;
    player.totalMoves = 0;
    player.bestGameMoves = 999999;
    player.averageMoves = BigDecimal.fromString("0");
  }
  return player;
}

export function handleGameCreated(event: GameCreated): void {
  let player = getOrCreatePlayer(event.params.whitePlayer.toHexString());
  player.gamesPlayed += 1;
  player.save();

  let game = new Game(event.params.gameId.toString());
  game.whitePlayer = player.id;
  game.movesCount = 0;
  game.winner = player.id;
  game.save();
}

export function handleMoveMade(event: MoveMade): void {
  let game = Game.load(event.params.gameId.toString());
  if (!game) return;

  let previousMove: Move | null
  previousMove = Move.load(event.params.gameId.toHexString() + "-" + game.movesCount.toString())

  let entity = new Move(event.params.gameId.toHexString() + "-" + (game.movesCount + 1).toString())
  entity.gameId = event.params.gameId
  entity.player = event.params.player
  entity.move = event.params.move
  entity.newPosition = event.params.newPosition
  entity.timestamp = event.block.timestamp

  if (previousMove) {
    entity.previousPosition = previousMove.newPosition
  } else {
    entity.previousPosition = ""
  }

  game.movesCount += 1;
  game.save();
  entity.save()
}

export function handleGameFinished(event: GameFinished): void {
  let game = Game.load(event.params.gameId.toString());
  if (!game) return;
  
  let player = getOrCreatePlayer(game.whitePlayer);
  
  if (event.params.winner.toHexString() == player.id) {
    player.totalMoves += game.movesCount;
    
    if (game.movesCount < player.bestGameMoves) {
      player.bestGameMoves = game.movesCount;
    }

    player.averageMoves = BigDecimal.fromString(player.totalMoves.toString())
      .div(BigDecimal.fromString(player.gamesPlayed.toString()));

    player.save();
  }
}