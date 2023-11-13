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

  // const transactionId = await postResponse.json();

  // let transactionHash = '';
  // const options = {
  //   method: 'GET',
  //   headers: {
  //     Authorization: `Bearer ${process.env.SYNDICATE_API_KEY}`
  //   }
  // };

  // const maxRetries = 10;
  // let attempts = 0;

  // while (!transactionHash && attempts < maxRetries) {
  //   try {
  //     const getResponse = await fetch(`https://api.syndicate.io/wallet/project/3568dd1d-1635-48f2-a1fd-25af23643b13/request/${transactionId}`, options);
  //     const data = await getResponse.json();
  //     transactionHash = data.transactionAttempts[0]?.hash || '';
  //   } catch (error) {
  //     console.error('Error getting transaction details:', error);
  //   }
  //   attempts++;
  //   if (!transactionHash && attempts < maxRetries) {
  //     await new Promise(resolve => setTimeout(resolve, 5000));  // Wait for 5 seconds
  //   }
  // }

  // if (!transactionHash) {
  //   throw new Error('Failed to retrieve transaction hash after maximum retries.');
  // }

  // const transactionUrl = `https://mumbai.polygonscan.com/tx/${transactionHash}`;
  // return transactionUrl;

export async function runFunction(name: string, args: any) {
  switch (name) {
    case "send_nft":
      return await send_nft(args["address"]);
    default:
      return null;
  }
}
