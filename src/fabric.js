const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function connectFabric() {
    try {
        const ccpPath = path.resolve(__dirname, '..', 'fabric-network', 'connection.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('mycontract');

        return contract;
    } catch (error) {
        console.error(`Failed to connect to Fabric network: ${error}`);
        throw error;
    }
}

module.exports = connectFabric;
