# Namecheap DNS Setup for batorbattle.space

This guide covers setting up DNS records in Namecheap for both the frontend (Netlify) and backend (AWS App Runner).

## Prerequisites

Before setting up DNS, you need:
1. **Netlify site deployed** - Get your Netlify site URL
2. **AWS App Runner service deployed** - Get your App Runner service URL (e.g., `https://xxxxx.us-east-1.awsapprunner.com`)

## Step 1: Access Namecheap DNS Settings

1. Log in to your Namecheap account: https://www.namecheap.com
2. Go to **Domain List** (or **Account** > **Domain List**)
3. Find `batorbattle.space` and click **Manage**
4. Go to the **Advanced DNS** tab

## Step 2: Set Up Frontend (batorbattle.space) for Netlify

### Option A: Use Netlify Nameservers (Recommended - Easiest)

1. In Netlify dashboard, go to **Site settings** > **Domain management**
2. Add `batorbattle.space` as custom domain
3. Netlify will show you nameservers (e.g., `dns1.p01.nsone.net`, `dns2.p01.nsone.net`)
4. In Namecheap:
   - Go to **Domain** > **Domain List** > Click **Manage** next to `batorbattle.space`
   - Go to **Nameservers** section
   - Select **Custom DNS**
   - Enter the nameservers provided by Netlify
   - Click **✓** to save
5. Netlify will handle all DNS automatically

### Option B: Manual DNS Records (If not using Netlify nameservers)

1. In Netlify dashboard, add `batorbattle.space` as custom domain
2. Netlify will show you the IP address to use
3. In Namecheap **Advanced DNS** tab, add:

   **A Record for root domain:**
   - **Type**: A Record
   - **Host**: `@`
   - **Value**: [Netlify IP address] (provided by Netlify)
   - **TTL**: Automatic (or 3600)
   - Click **✓** to save

   **CNAME Record for www:**
   - **Type**: CNAME Record
   - **Host**: `www`
   - **Value**: `your-site-name.netlify.app` (your Netlify site URL)
   - **TTL**: Automatic (or 3600)
   - Click **✓** to save

## Step 3: Set Up Backend (api.batorbattle.space) for AWS App Runner

### First: Get Your App Runner Service URL

1. Go to AWS App Runner Console: https://console.aws.amazon.com/apprunner
2. Select your service (e.g., `bator-battle-backend`)
3. Copy the **Service URL** (e.g., `https://xxxxx.us-east-1.awsapprunner.com`)
4. **Note**: You'll need this for the CNAME record

### Then: Add Custom Domain in AWS App Runner

1. In AWS App Runner, go to your service
2. Click **Custom domains** tab
3. Click **Add domain**
4. Enter: `api.batorbattle.space`
5. AWS will show you the CNAME target (e.g., `xxxxx.us-east-1.awsapprunner.com`)
6. **Copy this CNAME target** - you'll need it for Namecheap

### Finally: Add CNAME Record in Namecheap

1. In Namecheap, go to **Advanced DNS** tab for `batorbattle.space`
2. Click **Add New Record**
3. Select **CNAME Record**
4. Fill in:
   - **Host**: `api`
   - **Value**: `xxxxx.us-east-1.awsapprunner.com` (the CNAME target from AWS)
   - **TTL**: Automatic (or 3600)
5. Click **✓** to save

## Complete DNS Records Summary

After setup, your Namecheap DNS should have:

### If Using Netlify Nameservers:
- No DNS records needed in Namecheap (Netlify handles everything)
- Just set nameservers to Netlify's nameservers

### If Using Manual DNS:

```
Type    Host    Value                                    TTL
A       @       [Netlify IP address]                     Automatic
CNAME   www     [your-site.netlify.app]                 Automatic
CNAME   api     [xxxxx.us-east-1.awsapprunner.com]      Automatic
```

## Step 4: Wait for DNS Propagation

- DNS changes can take **1-48 hours** to propagate globally
- Usually takes **1-2 hours** for most locations
- You can check propagation status at: https://www.whatsmydns.net

### Test DNS Resolution

After adding records, test with:

```bash
# Test frontend
dig batorbattle.space
# or
nslookup batorbattle.space

# Test backend
dig api.batorbattle.space
# or
nslookup api.batorbattle.space
```

## Step 5: Verify SSL Certificates

### Netlify SSL
- Netlify automatically provisions SSL via Let's Encrypt
- Wait 5-10 minutes after DNS propagation
- Check in Netlify dashboard: **Site settings** > **Domain management**
- Should show "SSL certificate active"

### AWS App Runner SSL
- AWS automatically provisions SSL certificate
- Wait for DNS to propagate first
- Check in AWS App Runner console: **Custom domains** tab
- Status should change from "Pending" to "Active"

## Troubleshooting

### DNS Not Resolving?
- Wait longer (can take up to 48 hours)
- Check records are saved correctly in Namecheap
- Verify no typos in host or value fields
- Use `dig` or `nslookup` to check specific DNS servers

### SSL Certificate Not Issued?
- Ensure DNS is fully propagated (check with `dig`)
- Wait 10-15 minutes after DNS propagation
- Check status in respective dashboards (Netlify/AWS)

### CNAME Record Not Working?
- Ensure you're using the exact CNAME target from AWS App Runner
- Check there's no trailing dot in the value
- Verify TTL is set (not "Automatic" if having issues)

### Can't Access Site?
- Clear browser cache
- Try incognito/private browsing
- Check if DNS has propagated: https://www.whatsmydns.net
- Verify SSL certificates are active

## Quick Checklist

- [ ] Netlify site deployed and custom domain added
- [ ] AWS App Runner service deployed and custom domain added
- [ ] Nameservers set to Netlify (if using Option A) OR A/CNAME records added (if using Option B)
- [ ] CNAME record for `api` subdomain added in Namecheap
- [ ] Waited for DNS propagation (1-2 hours)
- [ ] SSL certificates active in both Netlify and AWS
- [ ] Tested `https://batorbattle.space` loads
- [ ] Tested `https://api.batorbattle.space` responds
- [ ] Updated `API_URL` in Netlify to `https://api.batorbattle.space`
- [ ] Updated `CORS_ORIGIN` in AWS App Runner to include `https://batorbattle.space`

## Example Screenshot Locations in Namecheap

1. **Domain List**: https://www.namecheap.com/myaccount/login.aspx?ReturnUrl=/domain/list/
2. **Advanced DNS**: After clicking "Manage" on domain, go to "Advanced DNS" tab
3. **Add Record**: Click "Add New Record" button in Advanced DNS section

## Need Help?

- **Namecheap Support**: https://www.namecheap.com/support/
- **Netlify Docs**: https://docs.netlify.com/domains-https/custom-domains/
- **AWS App Runner Docs**: https://docs.aws.amazon.com/apprunner/latest/dg/manage-custom-domains.html

