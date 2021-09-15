const cookiesToCopyInput = document.getElementById('cookiesToCopy');
const domainInput = document.getElementById('domain');
const errorsSpan = document.getElementById('errors')
const resultsSpan = document.getElementById('results');
const settingsForm = document.getElementById('settingsForm');

// Populate inputs with initial values
chrome.storage.sync.get(['cookiesToCopy', 'domain'], ({ cookiesToCopy, domain }) => {
  if (domain) {
    domainInput.value = domain;
  }

  if (cookiesToCopy) {
    cookiesToCopyInput.value = cookiesToCopy.join('\n');
  }
});

settingsForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const domain = document.getElementById('domain').value?.trim();
  const cookiesToCopy = document.getElementById('cookiesToCopy').value
    .split('\n')
    .map(val => val.trim())
    .filter(val => val);

  await chrome.storage.sync.set({
    cookiesToCopy,
    domain,
  });

  if (!domain || !cookiesToCopy.length) return;

  chrome.runtime.sendMessage({ type: 'COPY_COOKIES' }, ({ results, errors }) => {
    errorsSpan.innerText = errors.join('\n');
    resultsSpan.innerText = results.join('\n');
  });
});
