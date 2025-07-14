import sql from 'mssql';

// You'll need to replace 'YOUR_PUBLIC_IP' with your actual public IP address
const config = {
  user: 'priyaJ',
  password: '1234',
  server: 'YOUR_PUBLIC_IP', // Replace with your public IP
  database: 'userInsightsDB',
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
    encrypt: false // Set to true if you enable SSL
  },
  port: 1433,
  connectionTimeout: 30000,
  requestTimeout: 30000
};

async function testConnection() {
  console.log('Testing SQL Server connection...');
  console.log('Config:', {
    ...config,
    password: '***' // Hide password in logs
  });

  try {
    console.log('Attempting to connect...');
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✅ Connection successful!');
    
    // Test basic query
    console.log('Testing basic query...');
    const result = await pool.request().query('SELECT @@VERSION as version');
    console.log('SQL Server Version:', result.recordset[0].version);
    
    // Test database access
    console.log('Testing database access...');
    const dbResult = await pool.request().query('SELECT DB_NAME() as database_name');
    console.log('Connected to database:', dbResult.recordset[0].database_name);
    
    await pool.close();
    console.log('✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
    
    // Provide helpful troubleshooting tips
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Make sure SQL Server is running');
    console.log('2. Check if TCP/IP is enabled in SQL Server Configuration Manager');
    console.log('3. Verify Windows Firewall allows port 1433');
    console.log('4. Confirm SQL Server authentication is enabled');
    console.log('5. Check if your public IP is correct');
    console.log('6. Test local connection first with: sqlcmd -S MadhupriyajWS\\SQLEXPRESS -U priyaJ -P 1234');
  }
}

testConnection();