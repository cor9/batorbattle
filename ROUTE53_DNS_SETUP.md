# Using AWS Route 53 for DNS (Alternative to Namecheap)

If Namecheap cannot handle the long AWS certificate validation record names, you can use AWS Route 53 as your DNS provider. This is recommended by AWS and supports all record types natively.

## Cost
- **Route 53 Hosted Zone**: ~$0.50 per month per domain
- **DNS queries**: First 1 billion queries/month are free, then $0.40 per million queries
- **Total estimated cost**: ~$0.50-1.00/month for typical traffic

## Step 1: Create Hosted Zone in Route 53

1. Go to AWS Route 53 Console: https://console.aws.amazon.com/route53
2. Click **Hosted zones** in the left sidebar
3. Click **Create hosted zone**
4. Enter:
   - **Domain name**: `batorbattle.space`
   - **Type**: Public hosted zone
5. Click **Create hosted zone**
6. AWS will create the hosted zone and provide **4 nameservers** (e.g., `ns-123.awsdns-45.com`, `ns-456.awsdns-67.net`, etc.)
7. **Copy all 4 nameservers** - you'll need them for Namecheap

## Step 2: Update Nameservers in Namecheap

1. Log in to Namecheap: https://www.namecheap.com
2. Go to **Domain List**
3. Click **Manage** next to `batorbattle.space`
4. Go to **Nameservers** section
5. Change from **Namecheap BasicDNS** to **Custom DNS**
6. Enter the 4 nameservers from Route 53 (one per field):
   - Nameserver 1: `ns-123.awsdns-45.com`
   - Nameserver 2: `ns-456.awsdns-67.net`
   - Nameserver 3: `ns-789.awsdns-12.org`
   - Nameserver 4: `ns-012.awsdns-34.co.uk`
7. Click **✓** to save
8. Wait for nameserver propagation (1-24 hours, usually 1-2 hours)

## Step 3: Migrate Existing DNS Records to Route 53

After nameservers are updated, add all your existing DNS records in Route 53:

### In Route 53 Console → Your Hosted Zone → Create Record:

1. **Root Domain (ALIAS for Netlify)**:
   - **Record name**: Leave blank (or `@`)
   - **Record type**: A - IPv4 address
   - **Alias**: Yes
   - **Alias target**: Select "Netlify" or enter Netlify's load balancer
   - **Routing policy**: Simple routing
   - Click **Create records**

2. **WWW Subdomain (CNAME for Netlify)**:
   - **Record name**: `www`
   - **Record type**: CNAME - Routes traffic to another domain name
   - **Value**: `ephemeral-zuccutto-6a63c4.netlify.app.` (your Netlify site)
   - **TTL**: 300 (or default)
   - Click **Create records**

3. **API Subdomain (CNAME for AWS App Runner)**:
   - **Record name**: `api`
   - **Record type**: CNAME
   - **Value**: `ss24uxbrbt.us-west-2.awsapprunner.com.`
   - **TTL**: 300 (or default)
   - Click **Create records**

4. **AWS Certificate Validation Record 1**:
   - **Record name**: `_bef52731214f7bb7382fbdede38fd04b.api`
   - **Record type**: CNAME
   - **Value**: `_c2393ccbd7f7f1fdb201968bd94bd2c4.jkddzztszm.acm-validations.aws.`
   - **TTL**: 300 (or default)
   - Click **Create records**

5. **AWS Certificate Validation Record 2** (the long one):
   - **Record name**: `_2ad376a66dadb538885e99a47cbeb2fc.2a57j77qq20y5ehfkbn2udbglnlliy1.api`
   - **Record type**: CNAME
   - **Value**: `_3146b4a99f17a27f924da97429f43d97.jkddzztszm.acm-validations.aws.`
   - **TTL**: 300 (or default)
   - Click **Create records**

## Step 4: Wait for DNS Propagation

- Nameserver changes: 1-24 hours (usually 1-2 hours)
- DNS record updates: Usually immediate to 1 hour
- Check propagation: https://www.whatsmydns.net

## Step 5: Verify Everything Works

### Test DNS Resolution:
```bash
# Test root domain
dig batorbattle.space

# Test www
dig www.batorbattle.space

# Test api
dig api.batorbattle.space

# Test validation records
dig _bef52731214f7bb7382fbdede38fd04b.api.batorbattle.space
```

### Verify SSL Certificates:
- **Netlify**: Check in Netlify dashboard - should show "SSL active"
- **AWS App Runner**: Check in App Runner console - status should change to "Active"

## Benefits of Using Route 53

✅ **No character limits** - Supports any length DNS record names  
✅ **Native AWS integration** - Works seamlessly with App Runner, ACM, etc.  
✅ **Automatic health checks** - Can set up health checks for your services  
✅ **Easy management** - All DNS in one place (AWS console)  
✅ **Fast propagation** - AWS's global DNS network  
✅ **Cost-effective** - Very affordable for small to medium traffic  

## Important Notes

⚠️ **Before switching nameservers:**
- Make sure you've copied all existing DNS records from Namecheap
- Have the Route 53 hosted zone ready with all records
- Plan for 1-2 hours of potential downtime during nameserver propagation

⚠️ **After switching:**
- All DNS management happens in Route 53, not Namecheap
- Namecheap will only manage domain registration (renewal, transfer, etc.)
- DNS changes are made in AWS Route 53 console

## Alternative: Keep Namecheap DNS, Use Route 53 Only for Validation

If you want to keep Namecheap for most DNS but just need Route 53 for the validation records, you can:

1. Create a Route 53 hosted zone for `batorbattle.space`
2. Create a **delegated subdomain** for `api.batorbattle.space`
3. Set up a nameserver record in Namecheap pointing `api` to Route 53 nameservers
4. Add validation records in Route 53

However, this is more complex and the full migration is simpler.

## Troubleshooting

### DNS not resolving after nameserver change?
- Wait longer (can take up to 24 hours)
- Check nameservers are correctly set in Namecheap
- Verify records are created in Route 53
- Clear DNS cache: `sudo dscacheutil -flushcache` (Mac) or `ipconfig /flushdns` (Windows)

### SSL certificate still pending?
- Verify validation records are created in Route 53
- Check DNS propagation for validation records
- Wait 15-30 minutes after DNS propagation
- Check AWS App Runner console for status updates

## Cost Comparison

- **Namecheap DNS**: Free (included with domain)
- **Route 53**: ~$0.50/month + query costs (usually free for small sites)

**Recommendation**: Route 53 is worth the small cost for better AWS integration and no character limits.

