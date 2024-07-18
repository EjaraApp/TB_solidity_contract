import {
  Approval as ApprovalEvent,
  MinterRemoved as MinterRemovedEvent,
  MinterReplaced as MinterReplacedEvent,
  OperatorSet as OperatorSetEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  TokenInterTransferAllowed as TokenInterTransferAllowedEvent,
  TokenInterTransfered as TokenInterTransferedEvent,
  TokenItrAfterExpiryAllowed as TokenItrAfterExpiryAllowedEvent,
  Transfer as TransferEvent
} from "../generated/TBImpl/TBImpl"
import {
  Approval,
  MinterRemoved,
  MinterReplaced,
  OperatorSet,
  OwnershipTransferred,
  TokenInterTransferAllowed,
  TokenInterTransfered,
  TokenItrAfterExpiryAllowed,
  Transfer
} from "../generated/schema"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.TBImpl_id = event.params.id
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMinterRemoved(event: MinterRemovedEvent): void {
  let entity = new MinterRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.minter = event.params.minter

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMinterReplaced(event: MinterReplacedEvent): void {
  let entity = new MinterReplaced(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenId = event.params.tokenId
  entity.oldMinter = event.params.oldMinter
  entity.newMinter = event.params.newMinter

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOperatorSet(event: OperatorSetEvent): void {
  let entity = new OperatorSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.approved = event.params.approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokenInterTransferAllowed(
  event: TokenInterTransferAllowedEvent
): void {
  let entity = new TokenInterTransferAllowed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenId = event.params.tokenId
  entity.isTransferable = event.params.isTransferable

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokenInterTransfered(
  event: TokenInterTransferedEvent
): void {
  let entity = new TokenInterTransfered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.receiver = event.params.receiver
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokenItrAfterExpiryAllowed(
  event: TokenItrAfterExpiryAllowedEvent
): void {
  let entity = new TokenItrAfterExpiryAllowed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenId = event.params.tokenId
  entity.isTransferable = event.params.isTransferable

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caller = event.params.caller
  entity.sender = event.params.sender
  entity.receiver = event.params.receiver
  entity.TBImpl_id = event.params.id
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
