export const FirstPriceAuctionAbi = [
  {
    "inputs": [
      {
        "internalType": "contract ICurate",
        "name": "_curatedAds",
        "type": "address"
      },
      {
        "internalType": "contract IBilling",
        "name": "_billing",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_market",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "_bidder",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "_itemID",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "_bidPerSecond",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_newBalance",
        "type": "uint256"
      }
    ],
    "name": "BidUpdate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_market",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "_bidder",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "_itemID",
        "type": "bytes32"
      }
    ],
    "name": "NewHighestBid",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MIN_OFFER_DURATION",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "bids",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "previousBidPointer",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "nextBidPointer",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "bidder",
        "type": "address"
      },
      {
        "internalType": "uint64",
        "name": "startTimestamp",
        "type": "uint64"
      },
      {
        "internalType": "bool",
        "name": "removed",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "bidPerSecond",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "itemID",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "billing",
    "outputs": [
      {
        "internalType": "contract IBilling",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "curatedAds",
    "outputs": [
      {
        "internalType": "contract ICurate",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_market",
        "type": "address"
      }
    ],
    "name": "executeHighestBid",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_market",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_tokenID",
        "type": "uint256"
      }
    ],
    "name": "getAd",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_market",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_from",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_to",
        "type": "uint256"
      }
    ],
    "name": "getBids",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "previousBidPointer",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "nextBidPointer",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "bidder",
            "type": "address"
          },
          {
            "internalType": "uint64",
            "name": "startTimestamp",
            "type": "uint64"
          },
          {
            "internalType": "bool",
            "name": "removed",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "bidPerSecond",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "balance",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "itemID",
            "type": "bytes32"
          }
        ],
        "internalType": "struct FirstPriceAuction.Bid[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_market",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_tokenID",
        "type": "uint256"
      }
    ],
    "name": "getRef",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_itemID",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "_market",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_bidPerSecond",
        "type": "uint256"
      }
    ],
    "name": "placeBid",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_itemID",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "_market",
        "type": "address"
      }
    ],
    "name": "removeBid",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const