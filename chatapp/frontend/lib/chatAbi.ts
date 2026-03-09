export const chatAbi = [
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "address", name: "friendAddr", type: "address" },
    ],
    name: "FriendAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "message", type: "string" },
      { indexed: false, internalType: "uint256", name: "chatId", type: "uint256" },
      { indexed: false, internalType: "address", name: "sender", type: "address" },
      { indexed: false, internalType: "address", name: "receiver", type: "address" },
    ],
    name: "MessageSent",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "friendAddr", type: "address" }],
    name: "addFriend",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllUsers",
    outputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "ipfs", type: "string" },
          {
            components: [
              { internalType: "string", name: "name", type: "string" },
              { internalType: "address", name: "wallet", type: "address" },
            ],
            internalType: "struct Chat.Friend[]",
            name: "friends",
            type: "tuple[]",
          },
          { internalType: "bool", name: "isUser", type: "bool" },
        ],
        internalType: "struct Chat.Profile[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getMessages",
    outputs: [
      {
        components: [
          { internalType: "string", name: "message", type: "string" },
          { internalType: "uint256", name: "chatId", type: "uint256" },
          { internalType: "address", name: "sender", type: "address" },
          { internalType: "address", name: "receiver", type: "address" },
        ],
        internalType: "struct Chat.ChatMessage[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMyFriends",
    outputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "address", name: "wallet", type: "address" },
        ],
        internalType: "struct Chat.Friend[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "string", name: "message", type: "string" },
    ],
    name: "sendMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "ipfs", type: "string" },
    ],
    name: "setProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "myProfile",
    outputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "ipfs", type: "string" },
      { internalType: "bool", name: "isUser", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "users",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
