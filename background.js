chrome.runtime.onMessage.addListener(handleMessage);

chrome.runtime.onInstalled.addListener(handleInstall);

chrome.cookies.onChanged.addListener(handleCookieChange);

function handleCookieChange({ cookie, removed }) {
  chrome.storage.sync.get(['cookiesToSync', 'domain'], async ({ cookiesToSync, domain }) => {
    if (domain !== cookie.domain || !cookiesToSync.includes(cookie.name)) return;

    if (removed) {
      await chrome.cookies.remove({
        name: cookie.name,
        url: "http://localhost/",
      });

      return;
    }

    await chrome.cookies.set({
      domain: 'localhost',
      httpOnly: cookie.httpOnly,
      name: cookie.name,
      path: cookie.path,
      sameSite: cookie.sameSite,
      url: "http://localhost/",
      value: cookie.value,
    });
  });
}

function handleMessage(request, _, sendMessage) {
  switch (request.type) {
    case 'COPY_COOKIES': {
      copyCookiesToLocalhost().then(sendMessage);
    }
  }

  return true;
}

function handleInstall() {
  chrome.storage.sync.get(['cookiesToSync', 'domain'], async ({ cookiesToSync, domain }) => {
    if (!cookiesToSync && !domain) {
      await chrome.storage.sync.set({
        cookiesToSync: [],
        domain: '',
      });
    }
  });
}

async function copyCookiesToLocalhost() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['cookiesToSync', 'domain'], async ({ cookiesToSync, domain }) => {
      let cookies = await chrome.cookies.getAll({ domain });
      cookies = cookies.filter(cookie => cookiesToSync.includes(cookie.name));
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
