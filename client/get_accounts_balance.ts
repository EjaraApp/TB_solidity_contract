async function fetchGraphQL(operationsDoc, operationName, variables) {
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

(async () => {
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
  const transformedData = accounts.reduce((acc, item) => {
    acc[item.id] = +item.balance;
    return acc;
  }, {});

  return transformedData;
})();
