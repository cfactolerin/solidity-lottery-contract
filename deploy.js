const HDWalletProvider 	= require('truffle-hdwallet-provider');
const Web3 			   	= require('web3');

const { interface, bytecode } = require('./compile');

const mnemonics = ''; // Set the mnemonics here if you want to deploy

const provider 	= new HDWalletProvider(mnemonics,
					  				   'https://rinkeby.infura.io/BAfm7CdvxBX1NfHVevYk');
const web3		= new Web3(provider);

const deploy = async() => {
	accounts = await web3.eth.getAccounts();
	console.log('Deploying from account: ', accounts[0]);
	const result = await new web3.eth.Contract(JSON.parse(interface))
					.deploy({ data: bytecode, arguments: [] })
					.send({ from: accounts[0], gas: '1000000' });
	console.log('Contract deployed to: ', result.options.address);
};

deploy();