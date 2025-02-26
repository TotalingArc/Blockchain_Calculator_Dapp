import React, { useState } from "react";
import { BrowserProvider, Contract, ethers } from "ethers";
import tokenABI from "./contracts/tokenABI.json"; // Replace with the path to your Token ABI
import distributorABI from "./contracts/distributorABI.json"; // Replace with the path to your Distributor ABI
import { CONTRACT_ADDRESS, DISTRIBUTOR_CONTRACT_ADDRESS } from "./contracts/config"; // Replace with your contract addresses
import './App.css';

const Calculator = () => {
  const [display, setDisplay] = useState(""); // Holds the current equation/display
  const [mintStatus, setMintStatus] = useState(""); // Holds minting status messages
  const [walletConnected, setWalletConnected] = useState(false); // Tracks wallet connection
  const [tokenBalance, setTokenBalance] = useState("0"); // Tracks user's token balance
  const [stakeAmount, setStakeAmount] = useState(""); // Tracks stake amount input
  const [withdrawAmount, setWithdrawAmount] = useState(""); // Tracks withdrawal amount input
  const [stakedBalance, setStakedBalance] = useState("0"); // Track staked BALC tokens

  // Authenticate Wallet
  const authenticateWallet = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not found. Please install it to continue!");

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();
      console.log("Wallet connected:", walletAddress);

      await updateTokenBalance(signer); // Fetch token balance
      await updateStakedBalance(signer); // Fetch staked balance

      setWalletConnected(true);
      setMintStatus("Wallet connected successfully.");
    } catch (error) {
      console.error("Wallet connection error:", error);
      setMintStatus(`Error: ${error.message}`);
    }
  };

  // Fetch Token Balance
  const updateTokenBalance = async (signer) => {
    try {
      const contract = new Contract(CONTRACT_ADDRESS, tokenABI, signer);
      const walletAddress = await signer.getAddress();
      const balance = await contract.balanceOf(walletAddress);
      setTokenBalance(ethers.formatUnits(balance, 18)); // Convert from wei to readable units
    } catch (error) {
      console.error("Error fetching token balance:", error);
    }
  };

  // Fetch Staked Balance
  const updateStakedBalance = async (signer) => {
    try {
      const distributorContract = new Contract(
        DISTRIBUTOR_CONTRACT_ADDRESS,
        distributorABI,
        signer
      );

      const walletAddress = await signer.getAddress();
      const balance = await distributorContract.stakedBalances(walletAddress);

      setStakedBalance(ethers.formatUnits(balance, 18)); // Convert from wei to readable units
    } catch (error) {
      console.error("Error fetching staked balance:", error);
    }
  };

  // Handle button clicks
  const handleClick = async (value) => {
    if (value === "=") {
      if (!isValidEquation()) {
        setDisplay("Error: Invalid equation");
        return;
      }

      try {
        const result = eval(display); // Evaluate the equation
        setDisplay(result.toString()); // Update display with result

        // Mint token after successful equation
        await mintToken();
      } catch (error) {
        setDisplay("Error: Invalid equation");
      }
    } else if (value === "C") {
      setDisplay(""); // Clear display
    } else if (value === "Del") {
      setDisplay(display.slice(0, -1)); // Remove last character
    } else if (value === "%") {
      if (display.includes("%")) {
        const result = eval(display.replace("%", "*0.01"));
        setDisplay(result.toString());
      } else {
        const percentage = parseFloat(display) / 100;
        setDisplay(percentage.toString());
      }
    } else {
      setDisplay(display + value); // Add input to display
    }
  };

  // Validate equation
  const isValidEquation = () => {
    const validEquationRegex = /^-?\d+(\.\d+)?([+\-*/%-]-?\d+(\.\d+)?)*$/;
    return validEquationRegex.test(display);
  };

  // Mint token function
  const mintToken = async () => {
    try {
      if (!walletConnected) throw new Error("Please connect your wallet first!");

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, tokenABI, signer);

      const recipient = await signer.getAddress();
      console.log("Minting to recipient address:", recipient);

      const amount = ethers.parseUnits("1", 18);

      const tx = await contract.mint(recipient, amount);
      setMintStatus("Transaction sent. Waiting for confirmation...");
      console.log("Minting transaction hash:", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      await updateTokenBalance(signer);

      setMintStatus("Token minted successfully!");
    } catch (error) {
      console.error("Minting error:", error);
      setMintStatus(`Error: ${error.message}`);
    }
  };

  // Stake Tokens
  const stakeTokens = async () => {
    try {
      if (!walletConnected) throw new Error("Please connect your wallet first!");
      if (!stakeAmount || isNaN(stakeAmount) || stakeAmount <= 0) {
        throw new Error("Please enter a valid stake amount!");
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tokenContract = new Contract(CONTRACT_ADDRESS, tokenABI, signer);
      const distributorContract = new Contract(DISTRIBUTOR_CONTRACT_ADDRESS, distributorABI, signer);

      const approveTx = await tokenContract.approve(
        DISTRIBUTOR_CONTRACT_ADDRESS,
        ethers.parseUnits(stakeAmount.toString(), 18)
      );
      await approveTx.wait();

      const stakeTx = await distributorContract.stake(
        ethers.parseUnits(stakeAmount.toString(), 18)
      );
      setMintStatus("Transaction sent. Waiting for confirmation...");
      await stakeTx.wait();

      await updateTokenBalance(signer); // Update token balance
      await updateStakedBalance(signer); // Update staked balance

      setMintStatus(`Successfully staked ${stakeAmount} BALC tokens!`);
      setStakeAmount("");
    } catch (error) {
      console.error("Error staking tokens:", error);
      setMintStatus(`Error: ${error.message}`);
    }
  };

  // Withdraw Tokens
  const withdrawTokens = async () => {
    try {
      if (!walletConnected) throw new Error("Please connect your wallet first!");
      if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
        throw new Error("Please enter a valid withdrawal amount!");
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const distributorContract = new Contract(DISTRIBUTOR_CONTRACT_ADDRESS, distributorABI, signer);

      const withdrawTx = await distributorContract.unstake(
        ethers.parseUnits(withdrawAmount.toString(), 18)
      );
      setMintStatus("Transaction sent. Waiting for confirmation...");
      await withdrawTx.wait();

      await updateTokenBalance(signer); // Update token balance
      await updateStakedBalance(signer); // Update staked balance

      setMintStatus(`Successfully withdrew ${withdrawAmount} BALC tokens!`);
      setWithdrawAmount("");
    } catch (error) {
      console.error("Error withdrawing tokens:", error);
      setMintStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <button onClick={authenticateWallet} className="connect-wallet-button" disabled={walletConnected}>
        {walletConnected ? "Wallet Connected" : "Connect Wallet"}
      </button>

      <div className="calculator">
        <div className="display">{display}</div>

        <div className="buttons">
          {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "C", "0", ".", "+", "Del", "%", "="].map(
            (button) => (
              <button key={button} onClick={() => handleClick(button)}>
                {button}
              </button>
            )
          )}
        </div>
      </div>

      <div className="staking-section">
        <div>
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="Enter BALC to stake"
            className="input-field"
          />
          <button className="stake-button" onClick={stakeTokens}>
            Stake BALC
          </button>
        </div>
        <div>
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Enter BALC to withdraw"
            className="input-field"
          />
          <button className="withdraw-button" onClick={withdrawTokens}>
            Withdraw BALC
          </button>
        </div>
      </div>

      {walletConnected && (
        <>
          <p className="token-balance">Your BALC Balance: {tokenBalance}</p>
          <p className="token-balance">Your Staked Balance: {stakedBalance}</p>
        </>
      )}

      {mintStatus && <p className="status-message">{mintStatus}</p>}
    </div>
  );
};

export default Calculator;
;
