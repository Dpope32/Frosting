const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const UPLOAD_SERVER = 'http://192.168.1.32:3000';
const TEST_FILE = 'test-upload.txt';
const TEST_USERNAME = 'test-user';

// Simple validation
if (!fs.existsSync(TEST_FILE)) {
    console.error(`Test file ${TEST_FILE} not found!`);
    process.exit(1);
}

const fileStats = fs.statSync(TEST_FILE);
console.log(`Found test file: ${TEST_FILE} (${fileStats.size} bytes)`);

async function testServer() {
    try {
        // 1. Test health endpoint
        console.log('\nTesting health endpoint...');
        const health = await axios.get(`${UPLOAD_SERVER}/health`);
        console.log('Health check response:', health.data);

        // 2. Test stats endpoint
        console.log('\nTesting stats endpoint...');
        const stats = await axios.get(`${UPLOAD_SERVER}/stats/${TEST_USERNAME}`);
        console.log('Stats response:', stats.data);

        // 3. Test file upload
        console.log('\nTesting file upload...');
        const form = new FormData();
        form.append('file', fs.createReadStream(TEST_FILE));
        form.append('username', TEST_USERNAME);

        const upload = await axios.post(`${UPLOAD_SERVER}/upload`, form, {
            headers: {
                ...form.getHeaders(),
                'Accept': 'application/json'
            },
            // Add longer timeout since it's a file upload
            timeout: 10000
        });
        console.log('Upload response:', upload.data);

    } catch (error) {
        if (error.response) {
            // Server responded with error
            console.error('Server error:', {
                status: error.response.status,
                data: error.response.data
            });
        } else if (error.request) {
            // No response received
            console.error('No response from server:', error.message);
        } else {
            // Error before request could be made
            console.error('Request failed:', error.message);
        }
    }
}

console.log(`Testing upload server at ${UPLOAD_SERVER}`);
testServer();
