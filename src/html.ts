/**
 * Converts a base64 string to an ArrayBuffer.
 * 
 * @param base64 - The base64 encoded string
 * @returns - A promise that resolves to an ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64); // Decode base64 string to a binary string
    const length = binaryString.length;
    const bytes = new Uint8Array(length); // Create a new Uint8Array

    for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i); // Assign each character's char code to the array
    }

    return bytes.buffer; // Return the ArrayBuffer
}
/**
 * We store the favicon as Base64 content to be decoded at runtime
 * @returns ArrayBuffer of Favicon file
 */
export function favicon(): ArrayBuffer {
    const b64Favicon = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABHxJREFUWEe9l39Ionccxz/ePNaCeSzOi4iN7I6zLg4OaqWdlTHSnSUtqahQcrY/ojLOQY5+rCSi9lCrQ6zGqFb9YaWVFEUmW3H0Q29Os220ZWu6HVKEHNvVboK3HI/smuWP53HD+/4lfN7f9+f1/TxfP5/nIUDoRWcwGPVkMjkxNjb2ColEetXtdp86nc4/jo6OjpxO50OTyfQpADzD8AkaJgSKREVFMfPy8jr4fP7t0tJSUrDdNpsN+vr6fjIajesGg+H9/wLhB5CRkTHM5/Pz6+rqYvEaOhwOkEgkJrVa/QEAWPDuQ3XnAHJycmZ7enqK0tLSwvE409bW1loHBgZEALCB1+AMAD25QqEQBUv+9ATgmcsDxFcIcOV1gMvEwCmqqqp2RkZGWADgwAPhBUCfeXd392SgstsdAHt2D1y6RIDoKIDnfwH89hQg7hrAresA0a/5p2Gz2Ss6ne4d3ABcLnd9fn7+7sUN31kBnvwOkHID4Oob/0ZPTwH2fgH4+THAvWz/NAsLC3/W19cLbTabCgsCrQB9ampKG+y2ezwAhID/ldDWHA7n4dLSEhMTgMFgTKytrZVhCcONt7e3P25ra7sDAE9C7SUUFRU9mp2dTQ83AZZ+a2sLeDxemd1unwoJUF1d/ePg4CAVyzDcuMvlguzs7AdGo1ESEkAqldoQBEkINwEefWZm5rher68MCSCRSPZ7e3sT8RiGq6HT6cMGgwHtjkEXQSAQfDs+Pn47XHMs/cHBAXA4nCaLxdIVEoDNZn+p1WpxNQ2spL5xjUZzwuPxcgDAHBIgNTX1Y7Va3U6hUMLxx9QKhcLvx8bGMCuLtphosVi8LZfLb2C64hQcHx8Dm83GvIConbfH0Wi0L6anp4Xx8fE4U4SWicXiPYVCQcNqQmcA6I+SkpJvVCpV6v8lWFlZeS6VSjtNJlMbHi/fLn+npqZmqr+//yaejYE0Ozs7IBAIls1m87t4PS6Ombsikejz4eHhW3gNXujQkzc0NHxlNptXAWAaAPbxeASac/EsFmtcLBbTCwoKAkz787bohWtqatrT6/UT/5T9OgAUA4CGRCLF5Obm0re3t3+w2+1fB7oTQQcthUIpTUpKqqHRaIlcLvfN5ORk9MXFmx1tMgaD4WRubs5utVrNer0e7fe+U+/m6upqtNPpXE5JSbl2eHjoamlpWdzc3PwQAH71PQKeSR+TkJCQRyaTaUQiMcbj8bhdLte+xWJZDtFk3lYqlRPl5eVoNbxrd3cXGhsbJzUazUe+EHgA8DzKc5r09PSq0dHRIbRqvguFaG5uVs3MzDS8gIgIQFxcHEupVC4wmczLF+lRiNbW1hmVSuV9HBEBAIAYBoMxNDQ09B6VSvXLgULIZDLN5OTk/UgBoAd/q7CwsAtBkPJAEDqdDhAE+SSSAF6I4uLino6OjhIq1f+lC0GQR5EG8EKUlZU9kMlkRRchOjs7DS8DwAtRWVn5WUVFxT0WC/1oAlhcXAS5XN71sgC8EPn5+fezsrIy3W63e2NjY12r1Tb+Davdnqn9HZgvAAAAAElFTkSuQmCC'

    return base64ToArrayBuffer(b64Favicon);
}
/**
 * Returns the index HTML
 * 
 * @param host - The hostname received in the request
 * @param domain - A domain to be submitted
 * @returns - Home HTML in string format.
 */
export function homeHTML(host: string, domain: string | null): string {
    return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="color-scheme" content="light dark" />
        <link rel="stylesheet" href="/picocss.min.css" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="canonical" href="https://azure-osint.kmsec.uk" />
        <title>Azure OSINT</title>
        <meta property="og:title" content="Azure OSINT">
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://aad-osint.kmsec.uk/">
        <meta property="og:description" content="Azure OSINT - get Azure Tenant information for a domain">
    </head>
    <script>

        function formatContainer(title, content) {
            prettytitles = {
                "domain": "Requested Domain",
                "tenant_id": "Tenant ID",
                "brand": "Tenant Brand",
                "region": "Tenant Region"
            }
            return \`<h6 style="text-align: center; font-family: monospace">\${prettytitles[title]}</h6>
            <p style="text-align: center">\${content}</p>\`
          }
    
          async function submitForm(form) {
            event.preventDefault();
    
            // clear any previous output
            document.querySelectorAll(".additionalresults").forEach(resultcontainer => resultcontainer.remove())
            const countdomains = document.querySelector("#count")
            countdomains.textContent = ""
            const apiexample = document.querySelector("#exampledomain")
    
            const mainresult = document.querySelector("#results")
            mainresult.textContent = ""
    
            const raw = document.querySelector("#raw")
            raw.textContent = ""
            const domaincontainer = document.querySelector("#domaincontainer")
            domaincontainer.style.display = "none"
            const list = document.querySelector("#domainsresults")
            list.innerHTML = ""
    
            const rawcontainer = document.querySelector("#rawcontainer")



            // build the request
            const baseUrl = window.location.origin + '/api/'
            const formData = new FormData(form);
            params = new URLSearchParams(formData).toString()
            const requestUrl = (baseUrl + "?" + params)
            
            // UX: Update the URL to reflect input
            window.history.replaceState(null, "", \`/?domain=\${formData.get("domain")}\`)

            // retrieve the results
            response = await fetch(requestUrl)
    
            if (!response.ok) {
                    err = await response.json()
                    mainresult.innerHTML = \`<p style="color:red">Error: \${err.error}</p>\`
                    raw.textContent = JSON.stringify(err, null, " ")
                    rawcontainer.style.display = ""
                    apiexample.textContent = "contoso.org"
                    return
            }
            
            const results = await response.json()
            
            mainresult.innerHTML = formatContainer("domain", results.domain)
            apiexample.textContent = results.domain
    
            for (const [key, value] of Object.entries(results).filter(([key, value]) => !["domain", "domains"].includes(key))) {
                    mainresult.insertAdjacentHTML("afterend", \`<div class="additionalresults">\${formatContainer(key, value)}\`)        
            }
            countdomains.textContent = \` (\${results.domains.length})\`
            domaincontainer.style.display = ""
            template = document.querySelector("#domainitem")
            
            results.domains.sort().map(domain => {
                    const clone = template.content.cloneNode(true)
                    clone.querySelector("li").textContent = domain
                    return list.appendChild(clone)
            })
            
            raw.textContent = JSON.stringify(results, null, " ")
            rawcontainer.style.display = ""
          }
          window.onload = (event) => {
                const params = new URLSearchParams(window.location.search)
                domain = params.get("domain")
                if (domain) {
                        const button = document.querySelector("#submitbutton")
                        return button.click()
                }
              };
    </script>
    
    <body>
        <main class="container">
            <h1>Azure OSINT</h1>
            <p>Gather some info about a particular Azure Tenant.</p>
            <p>This is basically a less functional mirror of <a href="https://aadinternals.com/osint/">AAD Internals' OSINT
                    page</a>, but aims to do less, faster.</p>
            <p>With this tool, you can get the Tenant ID, Branding (brand name, not logo), Region, and associated domains
                (without the enrichment that AADInternals does) for an Azure Tenant.</p>
            <p>Because it does less, it's faster. Requesting <code>microsoft.com</code> will take roughly half the time (if
                not less!) with ${host} compared to AAD Internals' OSINT page (at the time of testing, 2.6s vs 5.4s).</p>
            <article>
                <header>
                    <h4>Retrieve Azure Tenant information for a domain</h4>
                </header>
                <p>Submit a domain</p>
                <form id="osint" method="get" action="/api/" onsubmit="return submitForm(this)">
                    <fieldset role="group">
                        <input id="submitdomain" name="domain" ${domain ? "value=" + domain : "" } type="text" placeholder="contoso.org" autofocus/>
                        <button id="submitbutton" type="submit">Submit</button>
                    </fieldset>
                </form>
                <h3>Results</h3>
                <div class="grid">
                    <div id="results">
                        Submit a domain to see the API response.
                    </div>
                </div>
                <template id="domainitem">
                    <li class="domain"></li>
                </template>
    
                <div class="grid">
                    <div id="domaincontainer"
                        style="display:none; padding:21px; border-style: solid; border-width: 1px; border-radius: 0.375rem; border-color: rgb(226 232 240)">
                        <h6 style="text-align: left; font-family: monospace;">Tenant domains <span id="count"></span></h6>
                        <ol id="domainsresults" style="list-style-type: '- ';">
                        </ol>
                    </div>
                    <div id="rawcontainer"
                        style="display:none; border-style: solid; border-width: 1px; border-radius: 0.375rem; border-color: rgb(226 232 240); padding:21px">
                        <details>
                            <summary>
                                <h6 style="color:#0172AC; text-align: center; font-family: monospace; display:inline">View the raw API
                                    response</h6>
                            </summary>
                            <pre><code id="raw"></code></pre>
                        </details>
                    </div>
                </div>
                <footer>
                    <h4>Use this API</h4>
                    <p>The API endpoint is at <code>/api/</code>, all you need to provide is a <code>domain</code> parameter
                    </p>
                    <p>A fully constructed URL would look like this:
                        <code>https://${host}/api/?domain=${domain ? "<span id=\"exampledomain\">" + domain + "</span>" : "<span id=\"exampledomain\">contoso.org</span>" }</code></p>
                </footer>
            </article>
            <article>
                <header>
                    <h4>About this site</h4>
                </header>
                <p>This was built to provide a quicker and less verbose public API for Azure OSINT.</p>
                <p>All information on how this works behind the scenes can be viewed on the <a href="https://github.com/kmsec-uk/azure-osint.kmsec.uk">Github repository</a>, however all functionality is
                    re-implemented from AADInternals so you're better off visiting <a href="https://aadinternals.com/osint/">AAD Internals's OSINT page</a> or viewing the enumeration
                    functions predominately found in
                    <code><a href="https://github.com/Gerenios/AADInternals/blob/master/AccessToken_utils.ps1">AccessToken_utils.ps1</a></code>
                    within AADInternals Suite.</p>
                <ul>
                    <li><code><a href="https://github.com/Gerenios/AADInternals/blob/0fa2edf5676439cd3fe7c92ed8006b63f0be9632/AccessToken_utils.ps1#L434">Get-OpenIDConfiguration</a></code>
                        - AADInternals uses this to retrieve the Region, but I use this as a shortcut to also get the Tenant
                        ID in one fetch request.</li>
                    <li><code><a href="https://github.com/Gerenios/AADInternals/blob/0fa2edf5676439cd3fe7c92ed8006b63f0be9632/AccessToken_utils.ps1#L287">Get-UserRealmV2</a></code>
                        - retrieves the brand identity</li>
                    <li><code><a href="https://github.com/Gerenios/AADInternals/blob/0fa2edf5676439cd3fe7c92ed8006b63f0be9632/AccessToken_utils.ps1#L1557">Get-TenantDomains</a></code>
                    </li>
                </ul>
                <footer>
                    <sub>
                        From <a href="https://kmsec.uk">kmsec</a>.
                        <br>
                        Source on <a href="https://github.com/kmsec-uk/azure-osint.kmsec.uk">Github</a>.
                        <br>
                        Styled with <a href="https://picocss.com/">PicoCSS</a>.
                        <br>
                        Built with <a href="https://workers.cloudflare.com/">Cloudflare Workers</a>.
                    </sub>
                </footer>
            </article>
        </main>
    </body>
    </html>`;
}