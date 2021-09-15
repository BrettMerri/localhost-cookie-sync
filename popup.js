const cookiesToSyncInput = document.getElementById('cookiesToSync');
const domainInput = document.getElementById('domain');
const errorsSpan = document.getElementById('errors')
const resultsSpan = document.getElementById('results');
const settingsForm = document.getElementById('settingsForm');

// Populate inputs with initial values
chrome.storage.sync.get(['cookiesToSync', 'domain'], ({ cookiesToSync, domain }) => {
  if (domain) {
    domainInput.value = domain;
  }

  if (cookiesToSync) {
    cookiesToSyncInput.value = cookiesToSync.join('\n');
  }
});

settingsForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const domain = document.getElementById('domain').value?.trim();
  const cookiesToSync = document.getElementById('cookiesToSync').value
    .split('\n')
    .map(val => val.trim())
    .filter(val => val);

  await chrome.storage.sync.set({
    cookiesToSync,
    domain,
  });

  if (!domain || !cookiesToSync.length) return;

  chrome.runtime.sendMessage({ type: 'COPY_COOKIES' }, ({ results, errors }) => {
    errorsSpan.innerText = errors.join('\n');
    resultsSpan.innerText = results.join('\n');
  });
});
