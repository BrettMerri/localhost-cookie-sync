const cookiesToCopyInput = document.getElementById('cookiesToCopy');
const domainInput = document.getElementById('domain');
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

  const cookiesToCopyInputValue = document.getElementById('cookiesToCopy').value;
  const cookiesToCopy = cookiesToCopyInputValue.split('\n');

  await chrome.storage.sync.set({
    cookiesToCopy,
    domain,
  });

  chrome.runtime.sendMessage({ type: 'COPY_COOKIES' }, response => {
    console.log(response);
    resultsSpan.innerText = response.join('\n');
  });
});
