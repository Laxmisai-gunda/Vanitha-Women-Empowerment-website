import { create } from 'ipfs-http-client';

const ipfs = create({ url: 'http://localhost:5001' });

export async function uploadToIPFS(file) {
    try {
        const { path } = await ipfs.add(file);
        return path; // IPFS hash
    } catch (error) {
        console.error(`Failed to upload file to IPFS: ${error}`);
        throw error;
    }
}

export async function retrieveFromIPFS(hash) {
    try {
        const stream = ipfs.cat(hash);
        let data = '';
        for await (const chunk of stream) {
            data += chunk.toString();
        }
        return data;
    } catch (error) {
        console.error(`Failed to retrieve file from IPFS: ${error}`);
        throw error;
    }
}
