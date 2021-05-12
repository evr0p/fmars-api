const Web3 = require('web3');
const web3 = new Web3('https://bsc-dataseed.binance.org/');
const { BEP20_ABI } = require('./bep20_abi.js');
const fetch = require('node-fetch');

// const { WebSocket } = require('ws');  
// const Web3 = require('web3');
// mainnet
// const web3 = new Web3('https://bsc-dataseed.binance.org/');
// const web3 = new Web3('https://bsc-dataseed1.defibit.io/');
// const web3 = new Web3('ws://127.0.0.1:8546');

// var web3 = new Web3("wss://dex.binance.org/api/ws");

const BSC_BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD';

const PANCAKE_CONTRACT = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82';
const WBNB_CONTRACT = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

const holder = '0xb2bFc0bbDc5FCF19C383C2613082354b4ADADD6B';

const FMARS_CONTRACT = "0x3974faa1429134b968c1b5684eebc4c96281afb0";
const PANCAKE_FMARS_CONTRACT = '0x912a5Ace202Cfd6Adc781839f6EC285C9DfcFb90';
const MAIN_WALLET = '0x6F6D9543Ff744d5310A6e77d2b983b44182dD9b4';

const FMARS_DECIMALS = 9;
const WBNB_DECIMALS = 18;


// web3.eth.getBalance(MAIN_WALLET).then((balance) => {
//     const bal = parseInt(balance);
//     console.log(bal  / 10**18);
// });

let tokenAddress = FMARS_CONTRACT;
let walletAddress = MAIN_WALLET;


/**
 * Fetches latest price of WBNB as reported from Bscascan API.
 * 
 * @returns {string} flaoting point as string
 */
 async function fetchBNBPrice()
 {
    const BSC_API_KEY = "PZ6MVCX5M15DMWIN13FG2JYAYZSBAPC1EQ";
    const BNB_PRICE_URL = `https://api.bscscan.com/api?module=stats&action=bnbprice&apikey=${BSC_API_KEY}`;
    return new Promise((resolve, reject) => {
        const req = fetch(BNB_PRICE_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        })
            .then(r => { /* console.log(r) */; return r.json() })
            .then(data => {
                let price = NaN;
                try { price = parseFloat(data.result.ethusd); }
                catch (e) {}
                resolve(price);
            })
            .catch((err) => resolve(false));
    });
}


/**
 * 
 */
async function fmarsStats()
{
    const bnb_price = fetchBNBPrice();
    const token = new web3.eth.Contract(BEP20_ABI, FMARS_CONTRACT);

    // return "hellox";
    const decimal = token.methods.decimals().call();
    const total_supply = token.methods.totalSupply().call();
    const burned_tokens = token.methods.balanceOf(BSC_BURN_ADDRESS).call();
    const liq_tokens = token.methods.balanceOf(PANCAKE_FMARS_CONTRACT).call();

    const wbnb = new web3.eth.Contract(BEP20_ABI, WBNB_CONTRACT);
    const liq_wbnb = wbnb.methods.balanceOf(PANCAKE_FMARS_CONTRACT).call();
    const wbnb_decimals = wbnb.methods.decimals().call();

    const supply = await total_supply - await burned_tokens;
    const circulating_supply = supply - await liq_tokens;
    const fmars_price = (await liq_wbnb / 10 ** await wbnb_decimals) / (await liq_tokens / 10 ** await decimal) * await bnb_price;

    return {
        totalSupply: await total_supply / Math.pow(10, await decimal),
        supply: supply / Math.pow(10, await decimal),
        circulatingSupply: circulating_supply / Math.pow(10, await decimal),
        liqTotalUsd: (await liq_tokens / 10 ** await decimal * fmars_price) + (await liq_wbnb / 10 ** await wbnb_decimals * await bnb_price),
        liqFmars: await liq_tokens / 10 ** await decimal,
        liqBnb: await liq_wbnb / 10 ** await wbnb_decimals,
        bnbPrice: await bnb_price,
        fmarsPrice: fmars_price, 
        marketCap: supply / 10 ** await decimal * fmars_price,
        burnedFmars: await burned_tokens / 10 ** await decimal,
    }
}



async function listen()
{


    const abi = [{
        "constant": false,
        "inputs": [
            {
                "name": "hashValue",
                "type": "string"
            }
        ],
        "name": "Transfer",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "",
                "type": "string"
            },
            {
                "indexed": false,
                "name": "",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "NewHashValue",
        "type": "event"
    }];
  

    const token = new web3.eth.Contract(BEP20_ABI, tokenAddress);
    const decimal = await token.methods.decimals().call();
    console.log(decimal);
    
    token.getPastEvents('Transfer', { fromBlock: 6850528, to: 'latest' }, (error, events) => {
        console.log(error);
        console.log(events);

        if (error) {
            console.log(error);
            return;
        }

        events.forEach(async (ev) => {
            // console.log(ev.transactionHash);
            const tx = await web3.eth.getTransactionReceipt(ev.transactionHash);
            console.log(tx);
        });
    });
}



module.exports = {
    fmarsStats: fmarsStats
};

 