/*
This is an example snippet - you should consider tailoring it
to your service.
*/

async function fetchGraphQL(operationsDoc: string, operationName: string, variables: {}) {
    const result = await fetch(
      "https://api.studio.thegraph.com/query/52116/ejara-tokenized-bond/version/latest",
      {
        method: "POST",
        body: JSON.stringify({
          query: operationsDoc,
          variables: variables,
          operationName: operationName
        })
      }
    );
  
    return await result.json();
  }
  
  const operationsDoc = `
    query MyQuery {
      accounts {
        balance
        id
      }
    }
  `;
  
  function fetchMyQuery() {
    return fetchGraphQL(
      operationsDoc,
      "MyQuery",
      {}
    );
  }
  
  async function startFetchMyQuery() {
    const okay = await fetchMyQuery();

  
    // do something great with this precious data
    console.log(okay);
  }
  
  startFetchMyQuery();