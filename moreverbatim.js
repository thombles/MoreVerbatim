const filter =
{
    url:
    [
        // Avoid listing all the ccTLDs
        // We can afford to be loose with this filter because we check for a specific flag inside the "q" param
        { hostContains: "www.google" },
        // DuckDuckGo's !g (and possibly HTTPS Everywhere?) send you here
        // https://encrypted.google.com/ says it will redirect to the main site after 30 April 2018
        { hostContains: "encrypted.google" }
    ]
};

// Given a query string (value of q=${qString}) then work out if we should fiddle with it
// + has already been converted to space
function processValue(qString)
{
    var matches = qString.match(/("[^"]+"|[^\s]+)/g); // Keep quoted terms together
    var removeTrigger = matches.filter((t) => { return t != "v" });
    if (removeTrigger.length == matches.length)
    {
        // User did not request MoreVerbatim by specifying "v" somewhere
        return qString;
    }
    
    // Now make sure they all have quotes on both sides
    var newTerms = removeTrigger.map((t) =>
    {
        // Matching implies we have at least one char here
        if (t[0] != '"')
        {
            t = `"${t}`;
        }
        if (t[t.length - 1] != '"')
        {
            t = `${t}"`;
        }
        return t;
    });

    return newTerms.join(" ");
}

// Event handler for navigation events that match our filter
function verbatimQueryString(details)
{
    // Find the part between ? and # - our GET query string
    const split1 = details.url.split("?");
    if (split1.length < 2)
    {
        // No query string
        return;
    }
    // Save the bits for later so we can re-assemble the full URL
    const page = split1[0];
    const split2 = split1[1].split("#");
    const queryString = split2[0];
    const anchor = split2[1] || "";

    // Now decode and store all our params so we can rebuild this
    // If this doesn't work out sensibly we won't do anything so funky sites should be fine
    var params = [];

    const vars = queryString.split('&');
    for (let i = 0; i < vars.length; i++)
    {
        var pair = vars[i].split('=');
        if (pair.length != 2)
        {
            // We are not on a google page
            return;
        }
        const key = decodeURIComponent(pair[0]);
        const value = decodeURIComponent(pair[1].replace(/\+/g, " "));
        params.push({ key: key, value: value});
    }

    // Now look for "q" and update it
    var foundQ = false;
    for (let i = 0; i < params.length; i++)
    {
        if (params[i].key == "q")
        {
            const newValue = processValue(params[i].value);
            if (newValue == params[i].value)
            {
                // We didn't change anything so let the request go ahead
                return;
            }
            params[i].value = newValue;
            foundQ = true;
        }
    }

    // There was no query string so give up
    if (!foundQ)
    {
        return;
    }

    // Now, rebuild the URL
    var newUrl = page + "?" + params.map((p) => {
            return encodeURIComponent(p.key) + "=" + encodeURIComponent(p.value)
        }).join("&") + (anchor ? "#" + anchor : "");

    // By this point we definitely made a change so redirect to the new URL
    // This will cause this script to be invoked again but this time we've stripped out the "v" so hopefully we won't recurse
    // Let's do a sanity check that the URL is in fact different
    if (newUrl != details.url)
    {
        browser.tabs.update(details.tabId,
        {
            url: newUrl
        });
    }
}

browser.webNavigation.onBeforeNavigate.addListener(verbatimQueryString, filter);
