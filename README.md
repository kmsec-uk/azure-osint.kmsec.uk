# Azure OSINT - a Cloudflare Worker that performs quick Azure Tenant OSINT on a domain

Try it out at [https://azure-osint.kmsec.uk/](https://azure-osint.kmsec.uk/)

This is basically a less functional mirror of
[AAD Internals' OSINT page](https://aadinternals.com/osint/), but aims to do
less, faster.

## Important update 15-08-2025: Getting tenant domains is broken

See [issue #1](/../../issues/1). Microsoft rolled out changes that [disable enumerating domains as an outsider](https://techcommunity.microsoft.com/blog/exchange/important-update-to-the-get-federationinformation-cmdlet-in-exchange-online/4410095). This has effectively broken OSINT capabilities.

[AADInternals OSINT page](https://aadinternals.com/osint/) still works although the reason is unclear. The underlying project has an open [issue #117](https://github.com/Gerenios/AADInternals/issues/117) for the same broken feature.

If a feasible workaround emerges, I will implement it.

## Overview

With this tool, you can get a high-level overview about an Azure Tenant:

* Tenant ID
* Associated domains - **BROKEN** - see above note
* Tenant region
* Tenant brand name

This tool does not do anything AAD Internals' OSINT page already does. In fact,
it does *less*. It will not provide additional enrichment on associated domains,
for example.

This tool also caches API responses with Cloudflare so that frequent requests
for a specific domain will return cached data.

Because it does less and caches responses, it's faster! Requesting
`microsoft.com` will take roughly half the time (if not less!) with
azure-osint.kmsec.uk compared to AAD Internals' OSINT page (at the time of
testing, 2.6s vs 5.4s).

Benefits over AAD Internals' OSINT page:

* Faster
* Shareable reports (You can share a domain report like this:
  `https://azure-osint.kmsec.uk/?domain=contoso.org`)
* API can be accessed from any origin

## Try it out!

[Check out an example report for contoso.org](https://azure-osint.kmsec.uk/?domain=contoso.org)

You can use the API at `/api/`. All you need to do is pass a `domain` parameter:

`curl https://azure-osint.kmsec.uk/api/?domain=contoso.org`

Response:

```json
{
  "domain": "contoso.org",
  "brand": "Contoso For Good",
  "tenant_id": "fdd5b9d8-e5a3-462c-a4f4-085264aaf66b",
  "region": "NA",
  "domains": [
    "M365x391229.mail.onmicrosoft.com",
    "contoso.org",
    "M365x391229.onmicrosoft.com"
  ]
}
```
