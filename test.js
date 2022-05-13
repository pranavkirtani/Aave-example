import { ethers } from 'ethers';
import pkg from '@aave/contract-helpers';
import math_pkg from '@aave/math-utils';
import dayjs from 'dayjs';
import fs from "fs";
let UiPoolDataProvider=pkg.UiPoolDataProvider;
let UiIncentiveDataProvider=pkg.UiIncentiveDataProvider
let ChainId=pkg.ChainId
 
// Sample RPC address for querying ETH mainnet
let provider = new ethers.providers.JsonRpcProvider(
  'https://rinkeby.infura.io/v3/<API-KEY>',
);

// This is the provider used in Aave UI, it checks the chainId locally to reduce RPC calls with frequent network switches, but requires that the rpc url and chainId to remain consistent with the request being sent from the wallet (i.e. actively detecting the active chainId)
 provider = new ethers.providers.StaticJsonRpcProvider(
  'https://rinkeby.infura.io/v3/<API-KEY>',
  ChainId.rinkeby,
);

// Aave protocol contract addresses, will be different for each market and can be found at https://docs.aave.com/developers/deployed-contracts/deployed-contracts
// For V3 Testnet Release, contract addresses can be found here https://github.com/aave/aave-ui/blob/feat/arbitrum-clean/src/ui-config/markets/index.ts
const uiPoolDataProviderAddress = '0x550f9764d56291B5B793b6dD1623af3346128BD2'.toLowerCase();
const uiIncentiveDataProviderAddress =
  '0x2c9f31b1F9838Bb8781bb61a0d0a4615f6530207'.toLowerCase();
const lendingPoolAddressProvider = '0xBA6378f1c1D046e9EB0F538560BA7558546edF3C'.toLowerCase();
const wethAbi=fs.readFileSync("wethGateway.abi",'utf-8');
const poolAbi=fs.readFileSync("pool.abi",'utf-8');
const erc20Abi=fs.readFileSync("erc20.abi",'utf-8');
// User address to fetch data for
const user = process.env.user.toLowerCase();
const privateKey=process.env.privateKey;
async function main(){
    
const poolDataProviderContract = new UiPoolDataProvider({
  uiPoolDataProviderAddress,
  provider,
});


const incentiveDataProviderContract = new UiIncentiveDataProvider({
  uiIncentiveDataProviderAddress,
  provider,
});


const reserves = await poolDataProviderContract.getReservesHumanized({
  lendingPoolAddressProvider,
});



let paramter={
    lendingPoolAddressProvider,
    user
  }
  console.log(paramter)
const userReserves = await poolDataProviderContract.getUserReservesHumanized(paramter);

// // Array of incentive tokens with price feed and emission APR
 const reserveIncentives =
  await incentiveDataProviderContract.getReservesIncentivesDataHumanized({
    lendingPoolAddressProvider,
  });

// Dictionary of claimable user incentives
const userIncentives =
  await incentiveDataProviderContract.getUserReservesIncentivesDataHumanized({
    lendingPoolAddressProvider,
    user,
  });



let formatReserves=math_pkg.formatReserves
let formatReservesAndIncentives=math_pkg.formatReservesAndIncentives
let formatUserSummary=math_pkg.formatUserSummary
// reserves input from Fetching Protocol Data section

const reservesArray = reserves.reservesData;
const baseCurrencyData = reserves.baseCurrencyData;

const currentTimestamp = dayjs().unix();

/*
- @param `reserves` Input from [Fetching Protocol Data](#fetching-protocol-data), `reserves.reservesArray`
- @param `currentTimestamp` Current UNIX timestamp in seconds
- @param `marketReferencePriceInUsd` Input from [Fetching Protocol Data](#fetching-protocol-data), `reserves.baseCurrencyData.marketReferencePriceInUsd`
- @param `marketReferenceCurrencyDecimals` Input from [Fetching Protocol Data](#fetching-protocol-data), `reserves.baseCurrencyData.marketReferenceCurrencyDecimals`
*/
const formattedReserves = formatReserves({
  reserves: reservesArray,
  currentTimestamp,
  marketReferenceCurrencyDecimals:
    baseCurrencyData.marketReferenceCurrencyDecimals,
  marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
});




const formatReservesAndIncent = formatReservesAndIncentives({
    reserves: reservesArray,
    currentTimestamp,
    marketReferenceCurrencyDecimals:
      baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    reserveIncentives,
  });

 

  const userReservesArray = userReserves.userReserves;
  const userSummary = formatUserSummary({
    currentTimestamp,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    marketReferenceCurrencyDecimals:
      baseCurrencyData.marketReferenceCurrencyDecimals,
    userReserves: userReservesArray,
    formattedReserves,
    userEmodeCategoryId: userReserves.userEmodeCategoryId,
  });

  console.log("userSummary",userSummary)





  let wethGatewayAddress="0xD1DECc6502cc690Bc85fAf618Da487d886E54Abe".toLowerCase()
  let poolAddress="0xE039BdF1d874d27338e09B55CB09879Dedca52D8".toLowerCase()


  /**
   * Deposit our ether with the WETH gateway, this will convert ether into a ERC20 wrapped version called WETH
   * It will also deposit WETH into the pool.
   */
   

  
   let wallet = new ethers.Wallet(process.env.privateKey, provider);
   const wethGateway = new ethers.Contract(wethGatewayAddress, wethAbi, provider);
   const wethGatewayContract = wethGateway.connect(wallet);
   const tx0=await wethGatewayContract.depositETH(poolAddress,user,0,{value:ethers.utils.parseUnits("0.01","ether")});
   console.log(tx0)

  /**
   * We borrow DAI using our desposit of WETH as collateral, 
   */

  const pool = new ethers.Contract(poolAddress,poolAbi, provider);
  const poolContract = pool.connect(wallet);
  const dai_reserve="0x4aaded56bd7c69861e8654719195fca9c670eb45"
  const tx1=await poolContract.borrow(dai_reserve,ethers.utils.parseUnits("0.004","ether"),1,0,user);
  console.log(tx1)

  /**
   * Now we repay the DAI.
   */
   const erc20 = new ethers.Contract(dai_reserve,erc20Abi, provider);
   const erc20Contract = erc20.connect(wallet);
   const tx2=await erc20Contract.approve(poolAddress,ethers.utils.parseUnits("0.004","ether"))
   console.log(tx2)
   const tx3=await poolContract.repay(dai_reserve,ethers.utils.parseUnits("0.004","ether"),1,user);
   console.log(tx3)
 
}


  main();


