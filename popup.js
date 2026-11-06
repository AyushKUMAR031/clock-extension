// Popup script for extension settings
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const userNameInput = document.getElementById('userNameInput');
  const saveNameBtn = document.getElementById('saveNameBtn');
  const currentNameEl = document.getElementById('currentName');
  const imageUpload = document.getElementById('imageUpload');
  const themeTitleInput = document.getElementById('themeTitleInput');
  const addThemeBtn = document.getElementById('addThemeBtn');
  const customThemesList = document.getElementById('customThemesList');
  const exportDataBtn = document.getElementById('exportDataBtn');
  const clearThemesBtn = document.getElementById('clearThemesBtn');
  const clearDataBtn = document.getElementById('clearDataBtn');
  const toast = document.getElementById('toast');

  // Load saved data
  loadSettings();
  loadCustomThemes();

  // Toast notification
  function showToast(message, isError = false) {
    toast.textContent = message;
    toast.className = 'toast show' + (isError ? ' error' : '');
    setTimeout(() => {
      toast.className = 'toast';
    }, 3000);
  }

  // Save user name
  saveNameBtn.addEventListener('click', () => {
    const name = userNameInput.value.trim();
    if (!name) return showToast('Please enter a name', true);

    chrome.storage.sync.set({ userName: name }, () => {
      currentNameEl.textContent = `Current: ${name}`;
      userNameInput.value = '';
      showToast('Name saved!');
    });
  });

  // Add custom theme
  addThemeBtn.addEventListener('click', () => {
    const file = imageUpload.files[0];
    const title = themeTitleInput.value.trim();

    if (!file) return showToast('Please select an image', true);
    if (!title) return showToast('Please enter a theme title', true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      const theme = {
        id: Date.now().toString(),
        name: title,
        img: base64,
        createdAt: new Date().toISOString()
      };

      chrome.storage.local.get({ customThemes: [] }, (data) => {
        const themes = [...data.customThemes, theme];
        chrome.storage.local.set({ customThemes: themes }, () => {
          renderCustomThemes(themes);
          themeTitleInput.value = '';
          imageUpload.value = '';
          showToast('Theme added! Open new tab to see it.');
        });
      });
    };
    reader.readAsDataURL(file);
  });

  // Export data
  exportDataBtn.addEventListener('click', () => {
    chrome.storage.local.get(null, (localData) => {
      chrome.storage.sync.get(null, (syncData) => {
        const exportData = {
          sync: syncData,
          local: localData,
          exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clock-extension-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    });
  });

  // Clear themes only
  clearThemesBtn.addEventListener('click', () => {
    if (!confirm('Delete all custom themes?')) return;
    chrome.storage.local.set({ customThemes: [] }, () => {
      loadCustomThemes();
      showToast('Themes cleared');
    });
  });

  // Clear all data
  clearDataBtn.addEventListener('click', () => {
    if (!confirm('This will delete all custom themes and your name. Continue?')) return;
    if (!confirm('Are you sure? This cannot be undone.')) return;

    chrome.storage.local.clear(() => {
      chrome.storage.sync.clear(() => {
        loadSettings();
        loadCustomThemes();
        showToast('All data cleared');
      });
    });
  });

  function loadSettings() {
    chrome.storage.sync.get({ userName: '' }, (data) => {
      currentNameEl.textContent = data.userName ? `Current: ${data.userName}` : 'Current: (not set)';
    });
  }

  function loadCustomThemes() {
    chrome.storage.local.get({ customThemes: [] }, (data) => {
      renderCustomThemes(data.customThemes);
    });
  }

  function updateThemeCount(count) {
    const section = document.querySelector('.settings-section:nth-of-type(2) h2');
    if (section) {
      section.innerHTML = `Custom Themes <span class="theme-count">(${count})</span>`;
    }
  }

  function renderCustomThemes(themes) {
    updateThemeCount(themes.length);
    
    if (themes.length === 0) {
      customThemesList.innerHTML = '<p class="empty-state">No custom themes yet. Add one above!<br><small>Images stored in browser, not in repo.</small></p>';
      return;
    }

    customThemesList.innerHTML = themes.map(theme => `
      <div class="custom-theme-item" data-id="${theme.id}">
        <img src="${theme.img}" class="custom-theme-thumb" alt="${theme.name}" />
        <div class="custom-theme-info">
          <div class="custom-theme-title">${escapeHtml(theme.name)}</div>
          <div class="custom-theme-meta">Added ${new Date(theme.createdAt).toLocaleDateString()}</div>
        </div>
        <button class="custom-theme-delete" data-id="${theme.id}" title="Delete this theme">🗑</button>
      </div>
    `).join('');

    // Add delete handlers
    customThemesList.querySelectorAll('.custom-theme-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        deleteTheme(id);
      });
    });
  }

  function deleteTheme(id) {
    chrome.storage.local.get({ customThemes: [] }, (data) => {
      const themes = data.customThemes.filter(t => t.id !== id);
      chrome.storage.local.set({ customThemes: themes }, () => {
        renderCustomThemes(themes);
        showToast('Theme deleted');
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});