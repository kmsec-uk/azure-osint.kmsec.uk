import { picoCSS, homeHTML, favicon } from "./html";
const tenantIdRegex = /\.com\/(?<tenant_id>.*)\/oauth/;
const domainsRegex = /<Domain>([a-zA-Z0-9\-\.]*)<\/Domain>/g;

export type ResponseError = {
    domain: string,
    error: string
}
export class AADInfo {
    domain: string;
    brand: string;
    tenant_id: string;
    region: string;
    domains: string[];
    soapBody: string;
    headers: {}

    constructor(domain: string) {
        this.domain = domain;
        this.brand = "";
        this.tenant_id = "";
        this.region = "";
        this.domains = [];
        this.soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:exm="http://schemas.microsoft.com/exchange/services/2006/messages" xmlns:ext="http://schemas.microsoft.com/exchange/services/2006/types" xmlns:a="http://www.w3.org/2005/08/addressing" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <soap:Header>
        <a:Action soap:mustUnderstand="1">http://schemas.microsoft.com/exchange/2010/Autodiscover/Autodiscover/GetFederationInformation</a:Action>
        <a:To soap:mustUnderstand="1">https://autodiscover-s.outlook.com/autodiscover/autodiscover.svc</a:To>
        <a:ReplyTo>
            <a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address>
        </a:ReplyTo>
    </soap:Header>
    <soap:Body>
        <GetFederationInformationRequestMessage xmlns="http://schemas.microsoft.com/exchange/2010/Autodiscover">
            <Request>
                <Domain>${domain}</Domain>
            </Request>
        </GetFederationInformationRequestMessage>
    </soap:Body>
</soap:Envelope>`;
            this.headers = {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            };
    }

    toDict() {
        return {
            domain: this.domain,
            brand: this.brand,
            tenant_id: this.tenant_id,
            region: this.region,
            domains: this.domains
        };
    }
    toError(errorMsg: string) {
        return {
            domain: this.domain,
            error: errorMsg
        }
    }

    async aadTenantInfo(): Promise<Response> {
        // console.log(`Enriching ${this.domain}`);
        const results = await Promise.allSettled([this.getTenantID(), this.getBrandInfo(), this.getAllDomains()])

        const errors = results.filter(
            (result): result is PromiseRejectedResult =>
                result.status === 'rejected'
        )
        if (errors.length > 0) {
            // console.log(errors.length)
            return new Response(
                JSON.stringify(this.toError(errors[0].reason.message)),
                {
                    status: 400,
                    statusText: "Invalid request",
                    headers: this.headers
                })
        }

        return new Response(
            JSON.stringify(this.toDict()),
            {
                status: 200,
                statusText: "OK",
                headers: this.headers
            }
        )
    }

    async getTenantID(): Promise<any> {
        const oidResponse = await fetch(`https://login.microsoftonline.com/${this.domain}/.well-known/openid-configuration`);
        // console.log(this.domain, "OID enrichment:", oidResponse.status);
        if (!oidResponse.ok) {
            throw new Error("invalid tenant")
        }
        const oidData: any = await oidResponse.json();
        this.region = oidData.tenant_region_scope;
        this.tenant_id = (oidData.token_endpoint.match(tenantIdRegex)?.groups || {}).tenant_id || "";

        return true
    }

    async getAllDomains(): Promise<any> {
        const soapHeaders = {
            'Content-Type': 'text/xml; charset=utf-8',
            'User-Agent': 'AutodiscoverClient',
            'SOAPAction': '"http://schemas.microsoft.com/exchange/2010/Autodiscover/Autodiscover/GetFederationInformation"'
        };
        const autodiscoverResponse = await fetch('https://autodiscover-s.outlook.com/autodiscover/autodiscover.svc', {
            method: 'POST',
            body: this.soapBody,
            headers: soapHeaders
        });
        // console.log(this.domain, "Autodiscover enrichment:", autodiscoverResponse.status);
        if (!autodiscoverResponse.ok) {
            throw new Error("autodiscover: could not get domains from Autodiscover")
        }
        const autodiscoverText = await autodiscoverResponse.text();

        this.domains = [...autodiscoverText.matchAll(domainsRegex)].map(match => match[1]);
        // We should throw an error if no domains were identified.
        if (this.domains.length === 0) {
            throw new Error("invalid tenant")
        }
        return true
    }

    async getBrandInfo(): Promise<any> {
        const brandResponse = await fetch(`https://login.microsoftonline.com/GetUserRealm.srf?login=nn@${this.domain}`);
        // console.log(this.domain, "Brand enrichment:", brandResponse.status);
        if (!brandResponse.ok) {
            throw new Error("brand enrichment: failed to fetch brand info")
        }
        const brandData: any = await brandResponse.json();
        if (brandData.NameSpaceType === "unknown") {
            throw new Error("invalid tenant")
        }
        this.brand = brandData.FederationBrandName;
        return true
    }
}

async function router(request: Request): Promise<Response> {
    const recievedURL = new URL(request.url)
    const receivedPath = recievedURL.pathname
    const receivedParams = recievedURL.searchParams
    
    if (request.method !== "GET") {
        return new Response("Only GET requests are supported", { status: 400 })
    }
    switch (receivedPath) {
        case '/' || '':
            var domain = receivedParams.get('domain')
            return new Response(homeHTML(recievedURL.host, domain), {
                status: 200,
                headers: {
                    "Content-Type": "text/html"
                }
            })
        case '/picocss.min.css':
            return new Response(picoCSS, {
                status: 200,
                headers: {
                    "Content-Type": "text/css",
                    "Cache-Control" : "max-age=31536000, public"
                }
            })
        case '/favicon.png':
            return new Response(favicon(), {
                headers: {
                    "Content-Type": "image/png"
                }
            })
        case '/api/' || '/api':
            var domain = receivedParams.get('domain')
            if (!domain) {
                return new Response("You must provide a domain name", {
                    status: 400,
                    headers: {
                        "Content-Type": "text/plain"
                    }
                })
            }
            return await new AADInfo(domain).aadTenantInfo()

        default:
            return new Response(null, {
                status: 404,
                statusText: "Not found"
            })
    }
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        return await router(request);
    },
};
