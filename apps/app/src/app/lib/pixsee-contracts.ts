import ShowFactoryABI from "@/abis/ShowFactory.json";
import ShowContractABI from "@/abis/ShowContract.json";
import BondingCurveABI from "@/abis/BoxOfficeBondingCurve.json";
import RouterABI from "@/abis/BuyAndUnlockRouter.json";

export const SHOW_FACTORY_ABI = ShowFactoryABI;
export const SHOW_CONTRACT_ABI = ShowContractABI;
export const BONDING_CURVE_ABI = BondingCurveABI;
export const ROUTER_ABI = RouterABI;

export const CHAIN_ID = 84532; // Base Sepolia — change to 8453 for mainnet

// CORS-friendly public RPC for browser clients.
// https://sepolia.base.org does NOT allow cross-origin requests from browsers.
export const BASE_SEPOLIA_RPC = "https://base-sepolia-rpc.publicnode.com";

export const CONTRACT_ADDRESSES = {
  usdc: "0xe81B9cC48E24819f009E40a2F78f30b9C9E35D3F",
  showFactory: "0x2FD3A36A1Fd8d232FAb59F9ff8E95C9e108c948F",
  subscriptionManager: "0x0F302b5feA905a56B6b3a8143A0dB60cb7cE0689",
  router: "0x19dc609C896c81f065bEd3d45DBbFf49405e7Dba",
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
