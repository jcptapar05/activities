export const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL as string

export const CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "id",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "first_name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "last_name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "middle_name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "position",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "cv",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "photo",
        type: "string",
      },
    ],
    name: "PersonAdded",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_id",
        type: "address",
      },
      {
        internalType: "string",
        name: "_first_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_last_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_middle_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_position",
        type: "string",
      },
      {
        internalType: "string",
        name: "_cv",
        type: "string",
      },
      {
        internalType: "string",
        name: "_photo",
        type: "string",
      },
    ],
    name: "addNewPerson",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "exists",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_id",
        type: "address",
      },
    ],
    name: "getPerson",
    outputs: [
      {
        internalType: "string",
        name: "first_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "last_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "middle_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "position",
        type: "string",
      },
      {
        internalType: "string",
        name: "cv",
        type: "string",
      },
      {
        internalType: "string",
        name: "photo",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPersonIds",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPersons",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "first_name",
            type: "string",
          },
          {
            internalType: "string",
            name: "last_name",
            type: "string",
          },
          {
            internalType: "string",
            name: "middle_name",
            type: "string",
          },
          {
            internalType: "string",
            name: "position",
            type: "string",
          },
          {
            internalType: "string",
            name: "cv",
            type: "string",
          },
          {
            internalType: "string",
            name: "photo",
            type: "string",
          },
        ],
        internalType: "struct IpfsActivity.Person[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "personIds",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "persons",
    outputs: [
      {
        internalType: "string",
        name: "first_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "last_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "middle_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "position",
        type: "string",
      },
      {
        internalType: "string",
        name: "cv",
        type: "string",
      },
      {
        internalType: "string",
        name: "photo",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const
