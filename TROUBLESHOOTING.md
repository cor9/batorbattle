# Troubleshooting SSL/DNS Issues

## Quick Diagnostic Commands

### Check DNS Resolution:
```bash
dig api.batorbattle.space
dig api.batorbattle.space +short
nslookup api.batorbattle.space
```

### Check SSL Certificate:
```bash
curl -I https://api.batorbattle.space
openssl s_client -connect api.batorbattle.space:443 -servername api.batorbattle.space
```

### Check if Backend is Running:
```bash
curl https://api.batorbattle.space/api/getToken
```

## Common Issues & Fixes

### Issue 1: DNS Not Propagated
**Symptoms:** `dig` shows old IP or no resolution
**Fix:** Wait longer (up to 24 hours) or check Route 53 records are correct

### Issue 2: SSL Certificate Still Pending
**Symptoms:** AWS App Runner shows "Pending certificate DNS validation"
**Fix:**
1. Verify both validation CNAME records exist in Route 53
2. Check validation records are correct (copy from AWS console)
3. Wait 15-30 minutes after DNS propagation
4. Check Route 53 records match exactly what AWS shows

### Issue 3: Certificate Validation Records Missing
**Symptoms:** Only one validation record in Route 53
**Fix:**
1. Go back to AWS App Runner → Custom domains → Configure DNS
2. Copy BOTH validation records
3. Add both to Route 53 (not just one)

### Issue 4: NS Delegation Not Working
**Symptoms:** `dig api.batorbattle.space` doesn't show Route 53 nameservers
**Fix:**
1. Check Namecheap has NS record for `api` subdomain
2. Verify NS record points to Route 53 nameservers
3. Wait for DNS propagation

### Issue 5: Backend Not Responding
**Symptoms:** Connection timeout or 502 error
**Fix:**
1. Check AWS App Runner service is running (green status)
2. Check CloudWatch logs for errors
3. Verify service URL works: `curl https://ss24uxbrbt.us-west-2.awsapprunner.com/api/getToken`

### Issue 6: CORS Errors
**Symptoms:** Browser console shows CORS errors
**Fix:**
1. Verify `CORS_ORIGIN` in App Runner includes `https://batorbattle.space`
2. Check backend was redeployed after CORS change
3. Clear browser cache

## What to Check Right Now

1. **AWS App Runner Custom Domain Status:**
   - Go to App Runner → Your service → Custom domains
   - What does it say? "Pending" or "Active"?

2. **Route 53 Records:**
   - Do you have all 3 records?
   - Main CNAME: `api` → `ss24uxbrbt.us-west-2.awsapprunner.com`
   - Validation 1: `_bef52731214f7bb7382fbdede38fd04b.api` → validation value
   - Validation 2: `_2ad376a66dadb538885e99a47cbeb2fc.2a57j77qq20y5ehfkbn2udbglnlliy1.api` → validation value

3. **Namecheap NS Record:**
   - Is there an NS record for `api` pointing to Route 53 nameservers?

4. **DNS Propagation:**
   - Run: `dig api.batorbattle.space`
   - Does it resolve to AWS App Runner IPs?

## Quick Fixes

### If SSL Still Pending:
1. Double-check validation records in Route 53 match AWS exactly
2. Wait 30 more minutes
3. Try unlinking and re-adding domain in App Runner (last resort)

### If DNS Not Working:
1. Verify NS delegation in Namecheap
2. Check Route 53 records are correct
3. Wait for propagation

### If Backend Not Responding:
1. Check App Runner service is running
2. Check CloudWatch logs
3. Test direct App Runner URL (bypass custom domain)

Tell me what specific error you're seeing and I'll help fix it!

