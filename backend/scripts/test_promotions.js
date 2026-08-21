const http = require('http');
const app = require('../src/app');

async function testPromotionApis() {
  const server = app.listen(0);
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  const makeRequest = (path, method = 'GET', body = null, headers = {}) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch(e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    console.log('\n--- 1. Testing GET /api/promotions/available ---');
    const availRes = await makeRequest('/api/promotions/available');
    console.log(`Status: ${availRes.status}`);
    console.log(`Found ${availRes.body.length} active promotion vouchers.`);
    if (availRes.body.length > 0) {
      console.log('Sample voucher:', availRes.body[0]);
    }

    console.log('\n--- 2. Testing POST /api/promotions/validate (Valid Voucher APPLE2M) ---');
    const validRes = await makeRequest('/api/promotions/validate', 'POST', {
      code: 'APPLE2M',
      totalAmount: 12343432
    });
    console.log(`Status: ${validRes.status}`, validRes.body);

    console.log('\n--- 3. Testing POST /api/promotions/validate (Percent Voucher PIGVIP10) ---');
    const percentRes = await makeRequest('/api/promotions/validate', 'POST', {
      code: 'PIGVIP10',
      totalAmount: 12343432
    });
    console.log(`Status: ${percentRes.status}`, percentRes.body);

    console.log('\n--- 4. Testing POST /api/promotions/validate (Under minOrderValue) ---');
    const underRes = await makeRequest('/api/promotions/validate', 'POST', {
      code: 'APPLE2M',
      totalAmount: 5000000
    });
    console.log(`Status: ${underRes.status}`, underRes.body);

    console.log('\n--- 5. Testing POST /api/promotions/validate (Invalid Code) ---');
    const invalidRes = await makeRequest('/api/promotions/validate', 'POST', {
      code: 'NON_EXISTING_CODE',
      totalAmount: 10000000
    });
    console.log(`Status: ${invalidRes.status}`, invalidRes.body);

    console.log('\n✓ All Promotion API tests completed successfully!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

testPromotionApis();
