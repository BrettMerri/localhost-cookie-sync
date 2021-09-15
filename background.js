chrome.runtime.onMessage.addListener(handleMessage);

chrome.runtime.onInstalled.addListener(handleInstall);

function handleMessage(request, _, sendMessage) {
  switch (request.type) {
    case 'COPY_COOKIES': {
      copyCookiesToLocalhost().then(sendMessage);
    }
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
      const errors = [];

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

          results.push(`Set ${cookie.name} cookie to localhost`);
        } catch (err) {
          errors.push(`Failed to set ${cookie.name} cookie to localhost`, err);
        }
      }

      resolve({ results, errors });
    });
  });
}
