import { ethers } from 'ethers';

declare global {
interface Window {
ethereum?: any;
}
}

export async function connectWallet() {
if (window.ethereum) {
try {
    // Request wallet connection
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Create an ethers.js provider from window.ethereum
    const provider = new ethers.BrowserProvider(window.ethereum);

    // You can now use this provider to interact with contracts
    return provider;
} catch (error) {
    console.error('User rejected wallet connection or other error:', error);
    throw error;
}
} else {
console.error('MetaMask or compatible wallet not found');
throw new Error('MetaMask not detected');
}
}
