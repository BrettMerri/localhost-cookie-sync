addListener();

// Remake listener to apply url filter
chrome.storage.onChanged.addListener(changes => {
  if ('url' in changes) {
    console.log('redo listener');
    removeListener();
    addListener();
  }
});

// Add XHR listener for provided url
async function addListener() {
  const url = await getStorageValue('url');

  if (!url) return;

  const filter = {
    types: ['xmlhttprequest'],
    urls: [url],
  };

  const opt_extraInfoSpec = ['responseHeaders', 'extraHeaders'];

  chrome.webRequest.onCompleted.addListener(
    handleWebRequestCompleted,
    filter,
    opt_extraInfoSpec,
  );
}

// Remove XHR listener
function removeListener() {
  chrome.webRequest.onCompleted.removeListener(handleWebRequestCompleted);
}

// Returns the parsed Set-Cookie header values
function getCookiesFromHeaders(headers) {
  if (!headers) return [];

  const setCookieHeaders = headers.filter(header => {
    return header.name === 'Set-Cookie';
  }).map(header => header.value);

  if (!setCookieHeaders) return [];

  const parsedSetCookieHeaders = setCookieHeaders.map(parseSetCookieString);

  return parsedSetCookieHeaders;
}

function getStorageValue(name) {
  return new Promise(resolve => {
    chrome.storage.sync.get(name, (result) => {
      resolve(result[name]);
    });
  });
}

// XHR Request onCompleted handler
async function handleWebRequestCompleted(details) {
  let cookies = getCookiesFromHeaders(details.responseHeaders);

  if (!cookies.length) return;

  const cookiesToPersist = await getStorageValue('cookiesToPersist');

  if (!cookiesToPersist) return;

  cookies = cookies.filter((cookie) => cookiesToPersist.includes(cookie.name));

  for (const cookie of cookies) {
    try {
      chrome.cookies.set({
        domain: 'localhost',
        httpOnly: cookie.httpOnly,
        name: cookie.name,
        path: cookie.path,
        sameSite: cookie.sameSite ? cookie.sameSite.toLowerCase() : undefined,
        url: "http://localhost/",
        value: cookie.value,
      });

      console.log(`Persisted ${cookie.name} cookie to localhost`);
    } catch (err) {
      console.error(`Failed to set cookie ${cookie.name}`, err);
    }
  }
}

// Parses the Set-Cookie header value.
// Taken from https://github.com/nfriedly/set-cookie-parser/blob/master/lib/set-cookie.js
function parseSetCookieString(setCookieValue) {
  function isNonEmptyString(str) {
    return typeof str === "string" && !!str.trim();
  }

  var parts = setCookieValue.split(";").filter(isNonEmptyString);
  var nameValue = parts.shift().split("=");
  var name = nameValue.shift();
  var value = nameValue.join("="); // everything after the first =, joined by a "=" if there was more than one part

  var cookie = {
    name: name, // grab everything before the first =
    value: value,
  };

  parts.forEach(function (part) {
    var sides = part.split("=");
    var key = sides.shift().trimLeft().toLowerCase();
    var value = sides.join("=");
    if (key === "expires") {
      cookie.expires = new Date(value);
    } else if (key === "max-age") {
      cookie.maxAge = parseInt(value, 10);
    } else if (key === "secure") {
      cookie.secure = true;
    } else if (key === "httponly") {
      cookie.httpOnly = true;
    } else if (key === "samesite") {
      cookie.sameSite = value;
    } else {
      cookie[key] = value;
    }
  });

  return cookie;
}
