import ShowFactoryABI from "@/abis/ShowFactory.json";
import ShowContractABI from "@/abis/ShowContract.json";
import BondingCurveABI from "@/abis/BoxOfficeBondingCurve.json";
import RouterABI from "@/abis/BuyAndUnlockRouter.json";
import ShowFeeDistributorABI from "@/abis/ShowFeeDistributor.json";

export const SHOW_FACTORY_ABI = ShowFactoryABI;
export const SHOW_CONTRACT_ABI = ShowContractABI;
export const BONDING_CURVE_ABI = BondingCurveABI;
export const ROUTER_ABI = RouterABI;
export const SHOW_FEE_DISTRIBUTOR_ABI = ShowFeeDistributorABI;

export const CHAIN_ID = 84532; // Base Sepolia — change to 8453 for mainnet

// CORS-friendly public RPC for browser clients.
// https://sepolia.base.org does NOT allow cross-origin requests from browsers.
export const BASE_SEPOLIA_RPC = "https://base-sepolia-rpc.publicnode.com";

export const CONTRACT_ADDRESSES = {
  usdc: "0x20D43f5e933aF75C17DdF68f428342b7C03f593b",
  showFactory: "0x78B90c6E25a428E27242338f10bBad0ab8663930",
  subscriptionManager: "0x0B518087e251157eFe9084E4F454e969931ac99d",
  router: "0xaCaf87b250b1B5df990380921B4e55f836023c05",
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
