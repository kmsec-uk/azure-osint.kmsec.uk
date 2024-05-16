const tenantIdRegex = /\.com\/(?<tenant_id>.*)\/oauth/;
const domainsRegex = /<Domain>([a-zA-Z0-9\-\.]*)<\/Domain>/g;

class AADInfo {
    domain: string;
    brand: string;
    tenant_id: string;
    region: string;
    domains: string[];
    soapBody: string;

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

    async aadTenantInfo(): Promise<string> {
        console.log(`Enriching ${this.domain}`);

        const soapHeaders = {
            'Content-Type': 'text/xml; charset=utf-8',
            'User-Agent': 'AutodiscoverClient',
            'SOAPAction': '"http://schemas.microsoft.com/exchange/2010/Autodiscover/Autodiscover/GetFederationInformation"'
        };

        try {
            const oidResponse = await fetch(`https://login.microsoftonline.com/${this.domain}/.well-known/openid-configuration`);
            console.log(this.domain, "OID enrichment:", oidResponse.status);
            if (oidResponse.ok) {
                const oidData: any = await oidResponse.json();
                this.region = oidData.tenant_region_scope;
                this.tenant_id = (oidData.token_endpoint.match(tenantIdRegex)?.groups || {}).tenant_id || "";
            }

            const autodiscoverResponse = await fetch('https://autodiscover-s.outlook.com/autodiscover/autodiscover.svc', {
                method: 'POST',
                body: this.soapBody,
                headers: soapHeaders
            });
            console.log(this.domain, "Autodiscover enrichment:", autodiscoverResponse.status);
            if (autodiscoverResponse.ok) {
                const autodiscoverText = await autodiscoverResponse.text();
                this.domains = [...autodiscoverText.matchAll(domainsRegex)].map(match => match[1]);
            }

            const brandResponse = await fetch(`https://login.microsoftonline.com/GetUserRealm.srf?login=nn@${this.domain}`);
            console.log(this.domain, "Brand enrichment:", brandResponse.status);
            if (brandResponse.ok) {
                const brandData: any = await brandResponse.json();
                this.brand = brandData.FederationBrandName;
            }
        } catch (e) {
            console.error(e);
            this.tenant_id = "error_enriching";
        }

        return JSON.stringify(this.toDict());
    }
}

async function testHelpers() {
    const aadInfo = await new AADInfo("lseg.com").aadTenantInfo();
    console.log(JSON.stringify(aadInfo));
}

async function router(request: Request): Promise<Response> {
	const recievedURL = new URL(request.url)
	const receivedPath = recievedURL.pathname
	const receivedParams = recievedURL.searchParams
	switch (receivedPath) {
		case '/' || '': 
			return new Response("Welcome")
		case '/api/' || '/api':
			const domain = receivedParams.get('domain')
			if (!domain) {
				return new Response("You must provide a domain name", {
					status: 400,
					statusText: ""
				})
			}
			const data = await new AADInfo(domain).aadTenantInfo()

			return new Response(data, {
				headers: {
					"content-type" : "text/json"
				}
			})

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
