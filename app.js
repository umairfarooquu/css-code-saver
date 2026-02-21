// Mock Data
const languages = [
    'ABAP', 'ADA', 'ActionScript', 'Bro...', 'C#', 'CSS', 'Cobol', 'JavaScript', 'Python', 'R', 'text'
];

let folders = [];
let snippets = [];

// State
let state = {
    searchQuery: '',
    folderId: null,      // null means "Dashboard" / All snippets
    language: null
};

// DOM Elements
const foldersList = document.getElementById('folders-list');
const languagesList = document.getElementById('languages-list');
const snippetsContainer = document.getElementById('snippets-container');
const searchInput = document.getElementById('search-input');

// Modal Elements
const createModal = document.getElementById('create-modal');
const editModal = document.getElementById('edit-modal');
const settingsModal = document.getElementById('settings-modal');
const createFolderModal = document.getElementById('create-folder-modal');

const createSnippetBtn = document.getElementById('create-snippet-btn');
const settingsBtn = document.getElementById('settings-btn');
const addFolderBtn = document.getElementById('add-folder-btn');
const closeBtns = document.querySelectorAll('.close-modal-btn, .cancel-modal-btn');

// Form Elements
const createForm = document.getElementById('create-snippet-form');
const languageSelect = document.getElementById('snippet-language-input');
const folderSelect = document.getElementById('snippet-folder-input');

// Edit Form Elements
const editForm = document.getElementById('edit-snippet-form');
const editIdInput = document.getElementById('edit-snippet-id');
const editTitleInput = document.getElementById('edit-title-input');
const editLanguageSelect = document.getElementById('edit-language-input');
const editFolderSelect = document.getElementById('edit-folder-input');
const editCodeInput = document.getElementById('edit-code-input');

// Folder Form Elements
const createFolderForm = document.getElementById('create-folder-form');
const folderNameInput = document.getElementById('folder-name-input');
const folderColorInput = document.getElementById('folder-color-input');

const themeToggle = document.getElementById('theme-toggle');

// Initialize
async function init() {
    await fetchFolders(); // Need folders before rendering sidebar and selects
    renderSidebar();
    populateSelects();
    await fetchSnippets();
    setupEventListeners();
    setupModalListeners();
}

async function fetchFolders() {
    try {
        const response = await fetch('/api/folders');
        if (response.ok) {
            folders = await response.json();
        } else {
            console.error('Failed to load folders');
        }
    } catch (error) {
        console.error('Error fetching folders:', error);
    }
}

async function fetchSnippets() {
    try {
        const response = await fetch('/api/snippets');
        if (response.ok) {
            snippets = await response.json();
            renderSnippets();
        } else {
            console.error('Failed to load snippets');
        }
    } catch (error) {
        console.error('Error fetching snippets:', error);
    }
}

function populateSelects() {
    const languageOptions = languages.map(l => `<option value="${l}">${l}</option>`).join('');
    const folderOptions = folders.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
    
    // Clear first to prevent duplication
    languageSelect.innerHTML = '<option value="" disabled selected>Select Language</option>' + languageOptions;
    folderSelect.innerHTML = '<option value="">None (Dashboard)</option>' + folderOptions;
    
    // Populate Edit forms
    editLanguageSelect.innerHTML = languageOptions;
    editFolderSelect.innerHTML = '<option value="">None (Dashboard)</option>' + folderOptions;
}

function renderSidebar() {
    const foldersList = document.getElementById('folders-list');
    const languagesList = document.getElementById('languages-list');

    foldersList.innerHTML = folders.map(f => `
        <li class="nav-item folder-item" data-id="${f.id}" data-type="folder">
            <div class="folder-info">
                <span class="folder-color" style="background-color: ${f.color};"></span>
                ${f.name}
            </div>
            <button class="btn btn-icon-small delete-folder-btn" title="Delete Folder" data-id="${f.id}">
                <i class="fa-solid fa-trash"></i>
            </button>
        </li>
    `).join('');

    // Render Languages
    languagesList.innerHTML = languages.map(l => `
        <li>
            <a href="#" class="nav-list-item" data-type="language" data-id="${l}">
                <div class="nav-icon-circle">${l.charAt(0).toUpperCase()}</div>
                ${l}
            </a>
        </li>
    `).join('');

    // Attach delete folder listeners
    document.querySelectorAll('.delete-folder-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent folder filter from triggering
            const id = e.currentTarget.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this folder? Snippets inside will be moved to Dashboard.')) {
                try {
                    const response = await fetch(`/api/folders/${id}`, { method: 'DELETE' });
                    if (response.ok) {
                        // Reset filter if deleting active folder
                        if (state.filterType === 'folder' && state.filterValue === id) {
                            state.filterType = null;
                            state.filterValue = null;
                        }
                        await fetchFolders();
                        await fetchSnippets(); // Fetch snippets again as their folderId might have been cleared
                        renderSidebar();
                        populateSelects(); // Re-render dropdowns
                    } else {
                        console.error('Failed to delete folder, status:', response.status);
                    }
                } catch (error) {
                     console.error('Error deleting folder:', error);
                }
            }
        });
    });
}

function renderSnippets() {
    // Filter snippets
    let filtered = snippets;
    
    if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        filtered = filtered.filter(s => s.title.toLowerCase().includes(q) || s.language.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
    }
    
    if (state.folderId) {
        filtered = filtered.filter(s => s.folderId === state.folderId);
    }
    
    if (state.language) {
        filtered = filtered.filter(s => s.language === state.language);
    }

    if (filtered.length === 0) {
        snippetsContainer.innerHTML = '<div style="text-align:center; padding: 2rem; color: #6b7280;">No snippets found.</div>';
        return;
    }

    snippetsContainer.innerHTML = filtered.map(s => `
        <div class="snippet-card">
            <div class="snippet-header">
                <div class="snippet-title-group">
                    <div class="snippet-title">${s.title}</div>
                    <div class="snippet-tag">${s.language}</div>
                </div>
                <div class="snippet-actions">
                    <button class="btn btn-icon-small edit-btn" title="Edit" data-id="${s.id}"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-icon-small delete-btn" title="Delete" data-id="${s.id}"><i class="fa-solid fa-trash"></i></button>
                    <button class="btn btn-icon-small copy-btn" title="Copy" data-code="${escapeHtml(s.code)}"><i class="fa-regular fa-clipboard"></i></button>
                </div>
            </div>
            <div class="snippet-body">
                <pre><code class="language-${s.language.toLowerCase()}">${escapeHtml(s.code)}</code></pre>
            </div>
        </div>
    `).join('');

    // Apply Highlight.js to newly created code blocks
    document.querySelectorAll('.snippet-body pre code').forEach((block) => {
        hljs.highlightElement(block);
    });

    // Attach copy event listeners
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const code = e.currentTarget.getAttribute('data-code');
            navigator.clipboard.writeText(code).then(() => {
                const icon = e.currentTarget.querySelector('i');
                icon.className = 'fa-solid fa-check';
                setTimeout(() => {
                    icon.className = 'fa-regular fa-clipboard';
                }, 2000);
            });
        });
    });

    // Attach edit event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const snippet = snippets.find(s => String(s.id) === String(id));
            
            if (snippet) {
                // Populate edit form
                editIdInput.value = snippet.id;
                editTitleInput.value = snippet.title;
                editLanguageSelect.value = snippet.language;
                editFolderSelect.value = snippet.folderId || '';
                editCodeInput.value = snippet.code;
                
                editModal.classList.add('active');
            }
        });
    });

    // Attach delete event listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this snippet?')) {
                try {
                    const response = await fetch(`/api/snippets/${id}`, { method: 'DELETE' });
                    if (response.ok) {
                        await fetchSnippets();
                    } else {
                         console.error('Failed to delete snippet, status:', response.status);
                    }
                } catch (error) {
                    console.error('Error deleting snippet:', error);
                }
            }
        });
    });
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderSnippets();
    });

    document.querySelectorAll('.sidebar-nav').forEach(nav => {
        nav.addEventListener('click', (e) => {
            const target = e.target.closest('.nav-list-item, .folder-item');
            // Ignore if clicking the delete folder button
            if (!target || e.target.closest('.delete-folder-btn') || e.target.closest('.add-btn')) return;
            e.preventDefault();
            
            // Remove active classes
            document.querySelectorAll('.nav-list-item, .nav-item, .folder-item').forEach(el => el.classList.remove('active'));
            target.classList.add('active');

            const type = target.getAttribute('data-type');
            const id = target.getAttribute('data-id');

            if (type === 'folder') {
                state.folderId = id;
                state.language = null;
            } else if (type === 'language') {
                state.language = id;
                state.folderId = null;
            }

            // reset query on sidebar change? optional.
            renderSnippets();
        });
    });

    // Special handler for "Dashboard" clear filters
    document.querySelector('.sidebar-nav .nav-item').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-list-item, .nav-item, .folder-item').forEach(el => el.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.folderId = null;
        state.language = null;
        state.searchQuery = '';
        searchInput.value = '';
        renderSnippets();
    });
}

function setupModalListeners() {
    // Open Modals
    createSnippetBtn.addEventListener('click', () => {
        createModal.classList.add('active');
    });

    settingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        settingsModal.classList.add('active');
    });

    if(addFolderBtn) {
        addFolderBtn.addEventListener('click', () => {
             createFolderModal.classList.add('active');
        });
    }

    // Close Modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            createModal.classList.remove('active');
            editModal.classList.remove('active');
            settingsModal.classList.remove('active');
            createFolderModal.classList.remove('active');
        });
    });

    // Close Modals on click outside
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // Handle Create Snippet Submit
    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('snippet-title-input').value;
        const language = document.getElementById('snippet-language-input').value;
        const folderId = document.getElementById('snippet-folder-input').value;
        const code = document.getElementById('snippet-code-input').value;

        const newSnippet = {
            title,
            language,
            folderId: folderId || null,
            code
        };

        try {
            const response = await fetch('/api/snippets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newSnippet)
            });

            if (response.ok) {
                // Reset and close
                createForm.reset();
                createModal.classList.remove('active');
                
                // Fetch updated snippets
                await fetchSnippets();
            } else {
                console.error('Error saving snippet');
            }
        } catch (error) {
            console.error('Error saving snippet:', error);
        }
    });

    // Handle Edit Snippet Submit
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = editIdInput.value;
        const title = editTitleInput.value;
        const language = editLanguageSelect.value;
        const folderId = editFolderSelect.value;
        const code = editCodeInput.value;

        const updatedSnippet = {
            title,
            language,
            folderId: folderId || null,
            code
        };

        try {
            const response = await fetch(`/api/snippets/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedSnippet)
            });

            if (response.ok) {
                editForm.reset();
                editModal.classList.remove('active');
                await fetchSnippets();
            } else {
                console.error('Error updating snippet');
            }
        } catch (error) {
            console.error('Error updating snippet:', error);
        }
    });

    // Handle Create Folder Submit
    createFolderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = folderNameInput.value;
        const color = folderColorInput.value;

        try {
            const response = await fetch('/api/folders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, color })
            });

            if (response.ok) {
                createFolderForm.reset();
                createFolderModal.classList.remove('active');
                await fetchFolders();
                renderSidebar();
                populateSelects(); // Update dropdown options with new folder
                // Reattach event listeners to the new sidebar items
                setupEventListeners();
            } else {
                console.error('Error saving folder');
            }
        } catch (error) {
            console.error('Error saving folder:', error);
        }
    });

    // Handle Theme Toggle
    themeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });
}

// Boot up
init();
