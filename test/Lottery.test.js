const assert  = require('assert');
const ganache = require('ganache-cli');			// Test network object
const Web3    = require('web3'); 				// Require the Web3 code. Need to capitalize to signify it as an Object
const { interface, bytecode } = require('../compile'); // Require the compiled interface and bytecode from compile.js

const provider = ganache.provider();
const web3    = new Web3(provider); 	// Creates the web3 instance of the Web3 object using ganache

let accounts;
let lottery;

beforeEach(async () => {
	// Get all accounts in the network
	accounts = await web3.eth.getAccounts();
	lottery = await new web3.eth.Contract(JSON.parse(interface))
					.deploy({ data: bytecode, arguments: [] })
					.send({ from: accounts[0], gas: '1000000' });

	lottery.setProvider(provider);
});

describe('Lottery Contract', () => {
  	
    it('deploys a contract', () => {
  		assert.ok(lottery.options.address);
  	});

    it('should allow a player to join if it sends a value', async() => {
      await lottery.methods.join().send({ from: accounts[1], 
                                          gas: '1000000',
                                          value: web3.utils.toWei('1', 'ether')});

      players = await lottery.methods.getPlayers().call({ from: accounts[0] });
      assert.equal(players.length, 1);
      assert.equal(players[0], accounts[1]);
    });

    it('should allow multiple accounts to enter', async() => {
      await lottery.methods.join().send({ from: accounts[1], 
                                          gas: '1000000',
                                          value: web3.utils.toWei('1', 'ether')});

      await lottery.methods.join().send({ from: accounts[2], 
                                          gas: '1000000',
                                          value: web3.utils.toWei('1', 'ether')});

      await lottery.methods.join().send({ from: accounts[3], 
                                          gas: '1000000',
                                          value: web3.utils.toWei('1', 'ether')});

      players = await lottery.methods.getPlayers().call({ from: accounts[0] });
      assert.equal(players.length, 3);
    });


    it('should require a minimum ether when joining', async() => {
      try {
        await lottery.methods.join().send({ from: accounts[1], 
                                          gas: '1000000',
                                          value: web3.utils.toWei('0.1', 'wei')});
        assert(fasle);
      } catch(err) {
        assert(err);
      }
    });

    it('should raise an error if a non manager picks a winner', async() => {
      try {
        await lottery.methods.pickWinner().send({ from: accounts[1]});
        assert(false);
      } catch(err) {
        assert(err);
      }
    });

    it('should allow a manager to pick a winner', async() => {
      await lottery.methods.join().send({ from: accounts[1], 
                                          gas: '1000000',
                                          value: web3.utils.toWei('2', 'ether')});

      const balanceBeforeWin = await web3.eth.getBalance(accounts[1]);
      await lottery.methods.pickWinner().send({ from: accounts[0] });
      const balanceAfterWin = await web3.eth.getBalance(accounts[1]);
      assert(balanceAfterWin > balanceBeforeWin);
    });

    it('should reset the players after picking a winner', async() => {
      await lottery.methods.join().send({ from: accounts[1], 
                                          gas: '1000000',
                                          value: web3.utils.toWei('2', 'ether')});

      await lottery.methods.pickWinner().send({ from: accounts[0] });

      players = await lottery.methods.getPlayers().call({ from: accounts[0] });
      assert.equal(players.length, 0);
    });
});