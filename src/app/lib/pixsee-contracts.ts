import ShowFactoryABI from "@/abis/ShowFactory.json";
import ShowContractABI from "@/abis/ShowContract.json";
import BondingCurveABI from "@/abis/BoxOfficeBondingCurve.json";
import RouterABI from "@/abis/BuyAndUnlockRouter.json";

export const SHOW_FACTORY_ABI = ShowFactoryABI;
export const SHOW_CONTRACT_ABI = ShowContractABI;
export const BONDING_CURVE_ABI = BondingCurveABI;
export const ROUTER_ABI = RouterABI;

export const CHAIN_ID = 84532; // Base Sepolia — change to 8453 for mainnet

export const CONTRACT_ADDRESSES = {
  usdc: "0x709285ca58A829073a691D173C190E0aE52C49dF",
  showFactory: "0xed590662b5FAB61f69645964E32b6517016b1F7B",
  subscriptionManager: "0x0Fbb50233d10CB78695b6bB0F945568BC3f39b9d",
  router: "0xD332E7871ebcaFe23f394552f71b1E4f19DDa16B",
} as const;

export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

// Testnet-only: MockUSDC faucet — mints tokens to the caller.
// Only deployed on Base Sepolia (CHAIN_ID 84532). Never exposed on mainnet.
export const MOCK_USDC_FAUCET_ABI = [
  {
    name: "faucet",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
] as const;
