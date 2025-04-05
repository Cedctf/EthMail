# EthMail Wallet Integration

This project integrates MetaMask cryptocurrency wallet into the EthMail application for Ethereum blockchain interactions.

## MetaMask Connect

The MetaMask connect component provides direct integration with the MetaMask browser extension:

- Detects if MetaMask is installed
- Connects to MetaMask wallet
- Shows wallet address and balance
- Handles account changes and disconnects

### Features

- **Easy Connection**: One-click wallet connection
- **Auto-Detection**: Detects if MetaMask is installed
- **Account Display**: Shows shortened wallet address and current balance
- **Real-time Updates**: Updates balance when accounts change
- **Clean UI**: Modern, branded interface matching MetaMask's style

## Usage

The MetaMask wallet is accessible through the wallet toggle button in the lower right corner of the application. When clicked, it will either:

1. Display a "Connect MetaMask" button if not connected
2. Show the connected account information if already connected

If MetaMask is not installed, clicking the connect button will redirect to the MetaMask installation page.

### Security Considerations

- MetaMask connection never exposes private keys to our application
- All signing operations happen in the secure MetaMask extension
- Users maintain full control of their wallet
- Connection can be revoked at any time from MetaMask

## Development

To extend the wallet functionality:

1. For transaction signing, use the `window.ethereum.request()` method:
   ```typescript
   const txHash = await window.ethereum.request({
     method: 'eth_sendTransaction',
     params: [{
       to: '0x...',
       from: accounts[0],
       value: '0x...',
       gas: '0x...'
     }]
   });
   ```

2. For message signing:
   ```typescript
   const signature = await window.ethereum.request({
     method: 'personal_sign',
     params: [message, accounts[0]]
   });
   ```

## Resources

- [MetaMask Developer Documentation](https://docs.metamask.io/)
- [Ethereum JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/) 