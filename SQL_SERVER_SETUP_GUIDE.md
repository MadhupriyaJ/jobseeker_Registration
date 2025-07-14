# SQL Server Remote Connection Setup Guide

## Step 1: Enable SQL Server Remote Connections

### Using SQL Server Configuration Manager:
1. Open **SQL Server Configuration Manager**
2. Navigate to **SQL Server Network Configuration** → **Protocols for SQLEXPRESS**
3. Enable **TCP/IP** protocol
4. Right-click **TCP/IP** → **Properties**
5. In **IP Addresses** tab, find **IPAll** section at the bottom
6. Set **TCP Port** to **1433**
7. Restart **SQL Server (SQLEXPRESS)** service

### Using SQL Server Management Studio:
1. Connect to your SQL Server instance
2. Right-click server name → **Properties**
3. Go to **Connections** page
4. Check **Allow remote connections to this server**
5. Set remote query timeout to 0 (unlimited)

## Step 2: Configure Windows Firewall

### Option A: Create specific rule (Recommended)
1. Open **Windows Firewall with Advanced Security**
2. Click **Inbound Rules** → **New Rule**
3. Select **Port** → **Next**
4. Select **TCP** and **Specific local ports: 1433**
5. Select **Allow the connection**
6. Apply to all network types
7. Name it "SQL Server Port 1433"

### Option B: Quick test (Temporary)
1. Open **Windows Defender Firewall**
2. Click **Turn Windows Defender Firewall on or off**
3. Temporarily turn off firewall for testing
4. **Remember to turn it back on after testing!**

## Step 3: Find Your Public IP Address

You need your **public IP address** (not local IP like 192.168.x.x):

### Method 1: Online
- Go to https://whatismyipaddress.com/
- Note down your IPv4 address

### Method 2: Command Line
```cmd
nslookup myip.opendns.com resolver1.opendns.com
```

## Step 4: Configure SQL Server Authentication

1. Open **SQL Server Management Studio**
2. Connect to your SQL Server
3. Right-click server → **Properties** → **Security**
4. Select **SQL Server and Windows Authentication mode**
5. Restart SQL Server service

## Step 5: Test Connection

After setup, test from command line:
```cmd
sqlcmd -S YourPublicIP,1433 -U priyaJ -P 1234 -d userInsightsDB
```

## Alternative: Use Dynamic DNS (If IP changes frequently)

If your IP changes often, consider:
1. **No-IP** (free dynamic DNS)
2. **DuckDNS** (free)
3. **Cloudflare Tunnel** (free, more secure)

## Security Considerations

⚠️ **Important Security Notes:**
- Opening SQL Server to internet has security risks
- Consider using VPN or SSH tunneling for production
- Use strong passwords
- Consider IP whitelisting in firewall rules
- Regular security updates

## Troubleshooting

### Common Issues:
1. **Connection timeout**: Check firewall settings
2. **Login failed**: Verify SQL Server authentication mode
3. **Server not found**: Confirm SQL Server service is running
4. **Port blocked**: Check if ISP blocks port 1433

### Test Local Connection First:
```cmd
sqlcmd -S MadhupriyajWS\SQLEXPRESS -U priyaJ -P 1234 -d userInsightsDB
```

## Next Steps After Setup

1. Get your public IP address
2. Update the connection string in the application
3. Test the connection from Replit
4. Create database tables