# Fix: Invalid Authorization Token Error

The error "could not establish signal connection: invalid authorization token" means your App Runner service doesn't have the correct LiveKit credentials configured.

## The Problem

Your App Runner service needs these environment variables to generate valid LiveKit tokens:

- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `LIVEKIT_URL`

## Solution: Update App Runner Environment Variables

### Step 1: Go to App Runner Console

1. Visit: https://console.aws.amazon.com/apprunner
2. Make sure you're in **`us-west-2`** region
3. Click on your service: **`cor9`**

### Step 2: Edit Configuration

1. Click **"Edit"** button (top right)
2. Scroll down to **"Configure service"** section
3. Expand **"Environment variables"**

### Step 3: Add/Update These Variables

Add or update these environment variables:

| Variable Name        | Value                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `LIVEKIT_API_KEY`    | `APIgmWaQh92ZWQB`                                                                            |
| `LIVEKIT_API_SECRET` | `kA9rcaOjZmgCHUpqdHsrLsIJUWw3PS2Nsp0M9K5PiNO`                                                |
| `LIVEKIT_URL`        | `wss://batorbattle-y2bc90qw.livekit.cloud`                                                   |
| `PORT`               | `8181`                                                                                       |
| `NODE_ENV`           | `production`                                                                                 |
| `CORS_ORIGIN`        | Your frontend URLs (e.g., `https://batorbattle.space,https://your-netlify-site.netlify.app`) |

**Important:**

- Make sure `LIVEKIT_URL` uses `wss://` (secure WebSocket), not `ws://`
- The URL should match your LiveKit Cloud project URL

### Step 4: Save and Deploy

1. Click **"Save changes"** at the bottom
2. App Runner will automatically start a new deployment
3. Wait 2-5 minutes for deployment to complete

### Step 5: Verify

After deployment completes, test the token endpoint:

```bash
curl -X POST https://ss24uxbrbt.us-west-2.awsapprunner.com/api/getToken \
  -H "Content-Type: application/json" \
  -d '{"roomName":"test","participantName":"test"}'
```

You should get a response with a valid token:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "url": "wss://batorbattle-y2bc90qw.livekit.cloud"
}
```

## Troubleshooting

### Still Getting Invalid Token Error?

1. **Verify LiveKit Credentials:**

   - Go to: https://cloud.livekit.io
   - Check your project's API key and secret match what you entered
   - Make sure the URL is correct

2. **Check App Runner Logs:**

   - In App Runner console, go to your service
   - Click **"Logs"** tab
   - Look for any errors related to LiveKit or token generation

3. **Verify Environment Variables:**

   - In App Runner, go to Configuration → Environment variables
   - Make sure all three LiveKit variables are set correctly
   - Check for typos or extra spaces

4. **Test Token Generation:**
   - Use the curl command above to test if tokens are being generated
   - If you get an error, check the server logs

### Common Issues

**Wrong URL Format:**

- ❌ `ws://batorbattle-y2bc90qw.livekit.cloud` (insecure)
- ✅ `wss://batorbattle-y2bc90qw.livekit.cloud` (secure)

**Missing Variables:**

- Make sure ALL three variables are set (API_KEY, API_SECRET, URL)

**Wrong Credentials:**

- Double-check your LiveKit Cloud dashboard for the correct values
- API keys are case-sensitive

## Quick Reference

- **App Runner Console:** https://console.aws.amazon.com/apprunner
- **LiveKit Cloud:** https://cloud.livekit.io
- **Your Service:** `cor9` in `us-west-2`
- **Service URL:** `https://ss24uxbrbt.us-west-2.awsapprunner.com`
