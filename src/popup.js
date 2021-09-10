const settingsForm = document.getElementById('settingsForm');

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(['cookiesToPersist', 'url'], ({ cookiesToPersist, url }) => {
    if (url) {
      const urlInput = document.getElementById('url');
      urlInput.value = url;
    }

    if (cookiesToPersist) {
      const cookiesToPersistInput = document.getElementById('cookiesToPersist');
      cookiesToPersistInput.value = cookiesToPersist.join("\n");
    }
  });
});

settingsForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const url = document.getElementById('url').value?.trim();

  const cookiesToPersistInputValue = document.getElementById('cookiesToPersist').value;
  const cookiesToPersist = cookiesToPersistInputValue.split("\n");

  await chrome.storage.sync.set({
    cookiesToPersist,
    url,
  });
});
