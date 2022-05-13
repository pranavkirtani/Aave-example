# Aave-example
This repo will help you learn how to use Aave smart contracts and SDKs in your applications.

# Getting Started 

This project uses Hardhat,If your new to Node.js and Aave utilities, I recommend you checkout their [documentation](https://github.com/aave/aave-utilities). 

## Installation

1. Clone this repo:
```
git clone git@github.com:pranavkirtani/Aave-example.git
cd Aave-example
```

2. Install dependencies:
   
``` 
   npm install
```
3. Run Tests:

``` 
   node test.js
```



## Scenarios covered by the example
The example covers following scenario
1. User deposits ETH with a gateway to get WETH
2. User deposits WETH with a pool and get aWethTokens as interest.
3. User borrows some DAI using WETH as collateral
4. User repays the borrowed DAI.

## Article
For a detailed explanation, please read my [Medium article](https://pranavkirtani.medium.com/how-to-build-your-own-defi-application-using-aaves-sdk-and-v3-smart-contracts-662818ffde88)

