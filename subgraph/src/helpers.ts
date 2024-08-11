import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Account, AccountToken } from "../generated/schema";

export function getOrCreateAccount(accountId: Address): Account {
  let acc = Account.load(accountId);
  if (acc == null) {
    acc = new Account(accountId);
  }
  acc.save();
  return acc;
}

export function getOrCreateAccountToken(
  accountId: Address,
  tokenId: BigInt
): AccountToken {
  const aTokenId = accountId.concat(Bytes.fromHexString(tokenId.toHexString()));
  let aToken = AccountToken.load(aTokenId);
  if (aToken == null) {
    aToken = new AccountToken(accountId);
    aToken.account = accountId;
    aToken.tokenId = tokenId;
    aToken.balance = BigInt.fromI32(0);
    aToken.save();
  }
  return aToken;
}
