chrome.runtime.onMessage.addListener(handleMessage);

chrome.runtime.onInstalled.addListener(handleInstall);

function handleMessage(request, _, sendMessage) {
  if (request.type === 'COPY_COOKIES') {
    copyCookiesToLocalhost().then(sendMessage);
  }

  return true;
}

function handleInstall() {
  chrome.storage.sync.get(['cookiesToCopy', 'domain'], async ({ cookiesToCopy, domain }) => {
    if (!cookiesToCopy && !domain) {
      await chrome.storage.sync.set({
        cookiesToCopy: ['at', 'authToken'],
        domain: 'dev.vroom.com',
      });
    }
  });
}

async function copyCookiesToLocalhost() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['cookiesToCopy', 'domain'], async ({ cookiesToCopy, domain }) => {
      let cookies = await chrome.cookies.getAll({ domain });
      cookies = cookies.filter(cookie => cookiesToCopy.includes(cookie.name));
      const results = [];

      for (const cookie of cookies) {
        try {
          chrome.cookies.set({
            domain: 'localhost',
            httpOnly: cookie.httpOnly,
            name: cookie.name,
            path: cookie.path,
            sameSite: cookie.sameSite,
            url: "http://localhost/",
            value: cookie.value,
          });
  
          results.push(`Persisted ${cookie.name} cookie to localhost`);
        } catch (err) {
          results.push(`Failed to set cookie ${cookie.name}`, err);
        }
      }

      resolve(results);
    });
  });
}
