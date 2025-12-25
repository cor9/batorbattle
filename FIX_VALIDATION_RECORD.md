# FIX: Second Validation Record

## Problem Found
The second validation record is NOT resolving. DNS check shows NXDOMAIN (doesn't exist).

## Exact Fix Needed

In Route 53 for `api.batorbattle.space` hosted zone:

### Current (WRONG):
Record name: `_2ad376a66dadb538885e99a47cbeb2fc.2a57j77qq20y5ehfkbn2udbglnlliy1.api.api.batorbattle.space`
(has extra `.api`)

### Should Be:
Record name: `_2ad376a66dadb538885e99a47cbeb2fc.2a57j77qq20y5ehfkbn2udbglnlliy1.api.batorbattle.space`
(remove one `.api`)

### Value Should Be:
`_3146b4a99f17a27f924da97429f43d97.jkddzztszm.acm-validations.aws.`

## Steps in Route 53:
1. Find the record with `_2ad376a66dadb538885e99a47cbeb2fc` in the name
2. Click Edit
3. Change record name from: `_2ad376a66dadb538885e99a47cbeb2fc.2a57j77qq20y5ehfkbn2udbglnlliy1.api.api.batorbattle.space`
4. To: `_2ad376a66dadb538885e99a47cbeb2fc.2a57j77qq20y5ehfkbn2udbglnlliy1.api.batorbattle.space`
5. Save

After fixing, wait 15-30 minutes for AWS to validate and issue SSL certificate.

