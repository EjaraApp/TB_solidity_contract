import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
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
} from "../generated/TBImpl/TBImpl"

export function createApprovalEvent(
  owner: Address,
  spender: Address,
  id: BigInt,
  amount: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("spender", ethereum.Value.fromAddress(spender))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return approvalEvent
}

export function createMinterRemovedEvent(minter: Address): MinterRemoved {
  let minterRemovedEvent = changetype<MinterRemoved>(newMockEvent())

  minterRemovedEvent.parameters = new Array()

  minterRemovedEvent.parameters.push(
    new ethereum.EventParam("minter", ethereum.Value.fromAddress(minter))
  )

  return minterRemovedEvent
}

export function createMinterReplacedEvent(
  tokenId: BigInt,
  oldMinter: Address,
  newMinter: Address
): MinterReplaced {
  let minterReplacedEvent = changetype<MinterReplaced>(newMockEvent())

  minterReplacedEvent.parameters = new Array()

  minterReplacedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  minterReplacedEvent.parameters.push(
    new ethereum.EventParam("oldMinter", ethereum.Value.fromAddress(oldMinter))
  )
  minterReplacedEvent.parameters.push(
    new ethereum.EventParam("newMinter", ethereum.Value.fromAddress(newMinter))
  )

  return minterReplacedEvent
}

export function createOperatorSetEvent(
  owner: Address,
  spender: Address,
  approved: boolean
): OperatorSet {
  let operatorSetEvent = changetype<OperatorSet>(newMockEvent())

  operatorSetEvent.parameters = new Array()

  operatorSetEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  operatorSetEvent.parameters.push(
    new ethereum.EventParam("spender", ethereum.Value.fromAddress(spender))
  )
  operatorSetEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return operatorSetEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createTokenInterTransferAllowedEvent(
  tokenId: BigInt,
  isTransferable: boolean
): TokenInterTransferAllowed {
  let tokenInterTransferAllowedEvent = changetype<TokenInterTransferAllowed>(
    newMockEvent()
  )

  tokenInterTransferAllowedEvent.parameters = new Array()

  tokenInterTransferAllowedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  tokenInterTransferAllowedEvent.parameters.push(
    new ethereum.EventParam(
      "isTransferable",
      ethereum.Value.fromBoolean(isTransferable)
    )
  )

  return tokenInterTransferAllowedEvent
}

export function createTokenInterTransferedEvent(
  from: Address,
  receiver: Address,
  amount: BigInt
): TokenInterTransfered {
  let tokenInterTransferedEvent = changetype<TokenInterTransfered>(
    newMockEvent()
  )

  tokenInterTransferedEvent.parameters = new Array()

  tokenInterTransferedEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  tokenInterTransferedEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
  )
  tokenInterTransferedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return tokenInterTransferedEvent
}

export function createTokenItrAfterExpiryAllowedEvent(
  tokenId: BigInt,
  isTransferable: boolean
): TokenItrAfterExpiryAllowed {
  let tokenItrAfterExpiryAllowedEvent = changetype<TokenItrAfterExpiryAllowed>(
    newMockEvent()
  )

  tokenItrAfterExpiryAllowedEvent.parameters = new Array()

  tokenItrAfterExpiryAllowedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  tokenItrAfterExpiryAllowedEvent.parameters.push(
    new ethereum.EventParam(
      "isTransferable",
      ethereum.Value.fromBoolean(isTransferable)
    )
  )

  return tokenItrAfterExpiryAllowedEvent
}

export function createTransferEvent(
  caller: Address,
  sender: Address,
  receiver: Address,
  id: BigInt,
  amount: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("caller", ethereum.Value.fromAddress(caller))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return transferEvent
}
