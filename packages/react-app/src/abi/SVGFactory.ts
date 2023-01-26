export const SVGFactoryAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_adContract",
        "type": "address"
      },
      {
        "internalType": "contract ICurate",
        "name": "_technicalCurate",
        "type": "address"
      },
      {
        "internalType": "contract ICurate",
        "name": "_contentCurate",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_curateProxy",
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
        "name": "ad",
        "type": "address"
      }
    ],
    "name": "NewAd",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "adContract",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "adCount",
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "ads",
    "outputs": [
      {
        "internalType": "contract SVG",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "allAds",
    "outputs": [
      {
        "internalType": "contract SVG[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newAdContract",
        "type": "address"
      }
    ],
    "name": "changeAdContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newCurateProxy",
        "type": "address"
      }
    ],
    "name": "changeCurateProxy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newGovernor",
        "type": "address"
      }
    ],
    "name": "changeGovernor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contentCurate",
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
        "internalType": "string",
        "name": "_svg",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_ref",
        "type": "string"
      }
    ],
    "name": "createAd",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "curateProxy",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "governor",
    "outputs": [
      {
        "internalType": "address",
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
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "items",
    "outputs": [
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "uint32",
        "name": "technicalRequestIndex",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "contentRequestIndex",
        "type": "uint32"
      },
      {
        "internalType": "bool",
        "name": "rewardClaimed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "technicalCurate",
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
        "internalType": "bytes32",
        "name": "_itemID",
        "type": "bytes32"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
] as const