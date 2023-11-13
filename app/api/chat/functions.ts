import { CompletionCreateParams } from "openai/resources/chat/index";

export const functions: CompletionCreateParams.Function[] = [
  {
    name: "send_nft",
    description:
      "Send an NFT.",
    parameters: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The address to send an NFT to",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "get_url",
    description:
      "Get the URL for a given transactionId.",
    parameters: {
      type: "object",
      properties: {
        transactionId: {
          type: "string",
          description: "The transactionId to get the URL for",
        },
      },
      required: ["transactionId"],
    },
  },
];

async function send_nft(address: string) {

  const requestBody = {
    projectId: '3568dd1d-1635-48f2-a1fd-25af23643b13',
    contractAddress: '0xbEc332E1eb3EE582B36F979BF803F98591BB9E24',
    chainId: 80001,
    functionSignature: 'mint(address account)',
    args: {
      account: address,
    }
  };

  const response = await fetch("https://api.syndicate.io/transact/sendTransaction", {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${process.env.SYNDICATE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return await response.json();
}

async function get_url(transactionId: string): Promise<string> {
  let transactionHash = '';
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.SYNDICATE_API_KEY}`
    }
  };

  // Keep trying until the transaction hash is available
  while (!transactionHash) {
    try {
      const response = await fetch(`https://api.syndicate.io/wallet/project/3568dd1d-1635-48f2-a1fd-25af23643b1/request/${transactionId}`, options);
      const data = await response.json();
      transactionHash = data.transactionAttempts[0]?.hash || '';
    } catch (error) {
      console.error('Error getting transaction details:', error);
    }
    // Wati for a few seconds before retrying
    if (!transactionHash) {
      await new Promise(resolve => setTimeout(resolve, 5000));  // Wait for 5 seconds
    }
  }

  return transactionHash;
}

export async function runFunction(name: string, args: any) {
  switch (name) {
    case "send_nft":
      return await send_nft(args["address"]);
    case "get_url":
      return await get_url(args["transactionId"]);
    default:
      return null;
  }
}
