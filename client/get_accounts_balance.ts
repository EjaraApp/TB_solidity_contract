async function fetchGraphQL(
  operationsDoc: any,
  operationName: any,
  variables: any
) {
  const result = await fetch(
    "https://api.studio.thegraph.com/query/52116/ejara-tokenized-bond/version/latest",
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

async function retrieveAddressesBalance(addresses: string[]) {
  const operationsDoc = `
  query MyQuery {
    accounts {
      id
      balance
    }
  }
`;

  const response = await fetchGraphQL(operationsDoc, "MyQuery", {});
  const accounts = response.data.accounts;

  const findAddressBalance = accounts
    .filter((account) => addresses.includes(account.id))
    .map((account) => ({ id: account.id, balance: Number(account.balance) }));

  return findAddressBalance;
}
