async function fetchGraphQLResult(
  operationsDoc: any,
  operationName: any,
  variables: any
) {
  const result = await fetch(
    "https://gateway.thegraph.com/api/f378441224e05bba010d39afb60997af/subgraphs/id/DiJkCgqt9yVSfrB7hiRdWCaqbobpTCPBxWHhzvkcAe7L",
    {
      method: "POST",
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName,
      }),
    }
  );

  return await result.json();
}

async function retrieveAddressesBalanceByTokenId(
  address: string,
  tokenId: number
) {
  const hexTokenId = `0x${+tokenId.toString(16)}`;
  const operationsDoc = `
    query MyQuery {
      accountToken(id: "${address}_${hexTokenId}") {
        tokenId
        id
        balance
      }
    }
  `;

  const response = await fetchGraphQLResult(operationsDoc, "MyQuery", {});

  const accountBalance = response.data.accountToken;
  return {
    tokenId: Number(accountBalance.tokenId),
    address: accountBalance.id.split("_")[0],
    balance: Number(accountBalance.balance),
  };
}
