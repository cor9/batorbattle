// Phase 2: Profile & Auth System
// Feature flagged - only active when FEATURES.PHASE2_PROFILES is true

// Make ProfileSystem globally accessible - after definition
// window.ProfileSystem = ProfileSystem; // Removed, will define later

// Profile Management
const ProfileSystem = {
  // Initialize profile system
  init() {
    // If disabled, ensure UI elements are hidden
    if (!FEATURES.PHASE2_PROFILES) {
      const elementsToHide = ['show-online-users-btn', 'edit-profile-btn', 'online-users-sidebar'];
      elementsToHide.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = 'none';
      });
      return;
    }

    this.setupEventListeners();
    this.loadProfile();
    // Auth check is handled by script.js navigation flow
  },

  // Check if user is authenticated
  checkAuth() {
    const profile = this.loadProfile();
    const userId = localStorage.getItem('batorbattle_userId');

    if (!profile || !userId) {
      // Show auth screen if feature is enabled
      if (FEATURES.PHASE2_PROFILES) {
        // For now, skip auth and go to age gate
        // When feature is enabled, show auth screen first
        return;
      }
    } else {
      gameState.profile = profile;
      gameState.userId = userId;
    }
  },

  // Setup event listeners
  setupEventListeners() {
    if (!FEATURES.PHASE2_PROFILES) return;

    // Profile creation
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const skipProfileBtn = document.getElementById('skip-profile-btn');
    const profilePhoto = document.getElementById('profile-photo');

    if (saveProfileBtn) {
      saveProfileBtn.addEventListener('click', () => this.saveProfile());
    }
    if (skipProfileBtn) {
      skipProfileBtn.addEventListener('click', () => this.skipProfile());
    }
    if (profilePhoto) {
      profilePhoto.addEventListener('change', (e) => this.handlePhotoUpload(e));
    }

    // Profile view modal
    const closeProfileModal = document.getElementById('close-profile-modal');
    const dmUserBtn = document.getElementById('dm-user-btn');
    const addFriendBtn = document.getElementById('add-friend-btn');
    const blockUserBtn = document.getElementById('block-user-btn');

    if (closeProfileModal) {
      closeProfileModal.addEventListener('click', () => this.closeProfileModal());
    }
    if (dmUserBtn) {
      dmUserBtn.addEventListener('click', () => this.openDM());
    }
    if (addFriendBtn) {
      addFriendBtn.addEventListener('click', () => this.addFriend());
    }
    if (blockUserBtn) {
      blockUserBtn.addEventListener('click', () => this.blockUser());
    }

    // Online users sidebar
    const toggleOnlineUsers = document.getElementById('toggle-online-users');
    if (toggleOnlineUsers) {
      toggleOnlineUsers.addEventListener('click', () => this.toggleOnlineUsersSidebar());
    }

    // Auth buttons
    const guestContinueBtn = document.getElementById('guest-continue-btn');
    if (guestContinueBtn) {
      guestContinueBtn.addEventListener('click', () => this.continueAsGuest());
    }

    // Phase 2 controls
    const showOnlineUsersBtn = document.getElementById('show-online-users-btn');
    const editProfileBtn = document.getElementById('edit-profile-btn');

    if (showOnlineUsersBtn) {
      showOnlineUsersBtn.addEventListener('click', () => {
        const sidebar = document.getElementById('online-users-sidebar');
        if (sidebar) {
          sidebar.classList.remove('hidden');
        }
      });
    }

    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', () => this.editProfile());
    }
  },

  // Generate unique user ID
  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // Save profile
  saveProfile() {
    const profile = {
      name: document.getElementById('profile-name')?.value.trim() || 'Anonymous',
      photo: gameState.profile?.photo || null,
      age: document.getElementById('profile-age')?.value || '',
      orientation: document.getElementById('profile-orientation')?.value || '',
      aboutMe: this.getSelectedTags(),
      links: {
        x: document.getElementById('profile-link-x')?.value.trim() || '',
        bluesky: document.getElementById('profile-link-bluesky')?.value.trim() || '',
        bateworld: document.getElementById('profile-link-bateworld')?.value.trim() || '',
        discord: document.getElementById('profile-link-discord')?.value.trim() || '',
        telegram: document.getElementById('profile-link-telegram')?.value.trim() || '',
        fetlife: document.getElementById('profile-link-fetlife')?.value.trim() || '',
        reddit: document.getElementById('profile-link-reddit')?.value.trim() || '',
      },
      createdAt: Date.now(),
      lastSeen: Date.now(),
    };

    // Generate user ID if doesn't exist
    if (!gameState.userId) {
      gameState.userId = this.generateUserId();
      localStorage.setItem('batorbattle_userId', gameState.userId);
    }

    // Save profile
    gameState.profile = profile;
    localStorage.setItem('batorbattle_profile', JSON.stringify(profile));
    localStorage.setItem('batorbattle_userId', gameState.userId);

    // Emit profile update to server
    if (socket) {
      socket.emit('profileUpdate', { userId: gameState.userId, profile });
    }

    // Go to lobby
    if (window.showScreen) {
      window.showScreen('lobby-screen');
    }
  },

  // Get selected tags
  getSelectedTags() {
    const checkboxes = document.querySelectorAll('#about-me-tags input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  },

  // Handle photo upload
  handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById('profile-photo-preview');
      if (preview) {
        preview.src = e.target.result;
        preview.style.display = 'block';
      }
      // Store as base64 for now (in production, upload to server)
      if (!gameState.profile) gameState.profile = {};
      gameState.profile.photo = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  // Skip profile creation
  skipProfile() {
    // Create minimal profile
    if (!gameState.userId) {
      gameState.userId = this.generateUserId();
      localStorage.setItem('batorbattle_userId', gameState.userId);
    }

    gameState.profile = {
      name: 'Anonymous',
      photo: null,
      age: '',
      orientation: '',
      aboutMe: [],
      links: {},
      createdAt: Date.now(),
    };

    localStorage.setItem('batorbattle_profile', JSON.stringify(gameState.profile));
    if (window.showScreen) {
      window.showScreen('lobby-screen');
    }
  },

  // Load profile from localStorage
  loadProfile() {
    try {
      const profileJson = localStorage.getItem('batorbattle_profile');
      if (profileJson) {
        return JSON.parse(profileJson);
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    }
    return null;
  },

  // Show profile view modal
  showProfile(userId, profile) {
    if (!FEATURES.PHASE2_PROFILES) return;

    const modal = document.getElementById('profile-view-modal');
    const content = document.getElementById('profile-view-content');

    if (!modal || !content) return;

    // Store current viewed user
    modal.dataset.viewedUserId = userId;

    // Build profile HTML
    content.innerHTML = `
      <div class="profile-view">
        ${profile.photo ? `<img src="${profile.photo}" alt="${profile.name}" class="profile-view-photo" />` : '<div class="profile-view-photo-placeholder">No Photo</div>'}
        <h2>${profile.name || 'Anonymous'}</h2>
        ${profile.age ? `<p><strong>Age:</strong> ${profile.age}</p>` : ''}
        ${profile.orientation ? `<p><strong>Orientation:</strong> ${profile.orientation}</p>` : ''}
        ${profile.aboutMe && profile.aboutMe.length > 0 ? `
          <div class="profile-tags">
            <strong>About:</strong>
            ${profile.aboutMe.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
        ${this.buildProfileLinks(profile.links)}
      </div>
    `;

    // Update button states
    const isFriend = gameState.friends.includes(userId);
    const isBlocked = gameState.blockedUsers.includes(userId);

    const addFriendBtn = document.getElementById('add-friend-btn');
    if (addFriendBtn) {
      addFriendBtn.textContent = isFriend ? 'Remove Friend' : 'Add Friend';
      addFriendBtn.dataset.isFriend = isFriend;
    }

    const blockUserBtn = document.getElementById('block-user-btn');
    if (blockUserBtn) {
      blockUserBtn.textContent = isBlocked ? 'Unblock' : 'Block';
      blockUserBtn.dataset.isBlocked = isBlocked;
    }

    modal.classList.remove('hidden');
  },

  // Build profile links HTML
  buildProfileLinks(links) {
    if (!links || Object.keys(links).length === 0) return '';

    const linkLabels = {
      x: 'X',
      bluesky: 'Bluesky',
      bateworld: 'Bateworld',
      discord: 'Discord',
      telegram: 'Telegram',
      fetlife: 'Fetlife',
      reddit: 'Reddit',
    };

    const linkItems = Object.entries(links)
      .filter(([key, value]) => value && value.trim())
      .map(([key, value]) => {
        let url = value;
        if (key === 'discord' && !value.startsWith('http')) {
          url = `https://discord.com/users/${value}`;
        } else if (key === 'telegram' && !value.startsWith('http')) {
          url = `https://t.me/${value.replace('@', '')}`;
        }
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkLabels[key]}</a>`;
      })
      .join(' | ');

    return linkItems ? `<div class="profile-links"><strong>Links:</strong> ${linkItems}</div>` : '';
  },

  // Close profile modal
  closeProfileModal() {
    const modal = document.getElementById('profile-view-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  },

  // Open DM
  openDM() {
    const modal = document.getElementById('profile-view-modal');
    const userId = modal?.dataset.viewedUserId;
    if (!userId) return;

    // Close profile modal
    this.closeProfileModal();

    // Open chat sidebar and focus on DM
    // TODO: Implement DM functionality
    alert('Direct Message feature coming soon!');
  },

  // Add/Remove friend
  addFriend() {
    const modal = document.getElementById('profile-view-modal');
    const userId = modal?.dataset.viewedUserId;
    if (!userId) return;

    const isFriend = gameState.friends.includes(userId);

    if (isFriend) {
      gameState.friends = gameState.friends.filter(id => id !== userId);
    } else {
      gameState.friends.push(userId);
    }

    // Save to localStorage
    localStorage.setItem('batorbattle_friends', JSON.stringify(gameState.friends));

    // Update UI
    const addFriendBtn = document.getElementById('add-friend-btn');
    if (addFriendBtn) {
      addFriendBtn.textContent = isFriend ? 'Add Friend' : 'Remove Friend';
      addFriendBtn.dataset.isFriend = !isFriend;
    }

    // Emit to server
    if (socket) {
      socket.emit('friendUpdate', { userId, action: isFriend ? 'remove' : 'add' });
    }
  },

  // Block/Unblock user
  blockUser() {
    const modal = document.getElementById('profile-view-modal');
    const userId = modal?.dataset.viewedUserId;
    if (!userId) return;

    const isBlocked = gameState.blockedUsers.includes(userId);

    if (isBlocked) {
      gameState.blockedUsers = gameState.blockedUsers.filter(id => id !== userId);
    } else {
      gameState.blockedUsers.push(userId);
    }

    // Save to localStorage
    localStorage.setItem('batorbattle_blockedUsers', JSON.stringify(gameState.blockedUsers));

    // Update UI
    const blockUserBtn = document.getElementById('block-user-btn');
    if (blockUserBtn) {
      blockUserBtn.textContent = isBlocked ? 'Block' : 'Unblock';
      blockUserBtn.dataset.isBlocked = !isBlocked;
    }

    // Emit to server
    if (socket) {
      socket.emit('blockUpdate', { userId, action: isBlocked ? 'unblock' : 'block' });
    }

    // Close modal
    this.closeProfileModal();
  },

  // Toggle online users sidebar
  toggleOnlineUsersSidebar() {
    const sidebar = document.getElementById('online-users-sidebar');
    if (!sidebar) return;

    sidebar.classList.toggle('hidden');
  },

  // Continue as guest
  continueAsGuest() {
    // Skip profile creation, go to age gate
    showScreen('age-gate');
  },

  // Edit profile
  editProfile() {
    if (!FEATURES.PHASE2_PROFILES) return;

    // Load existing profile data into form
    const profile = this.loadProfile();
    if (profile) {
      if (document.getElementById('profile-name')) {
        document.getElementById('profile-name').value = profile.name || '';
      }
      if (document.getElementById('profile-age')) {
        document.getElementById('profile-age').value = profile.age || '';
      }
      if (document.getElementById('profile-orientation')) {
        document.getElementById('profile-orientation').value = profile.orientation || '';
      }

      // Set photo preview
      if (profile.photo) {
        const preview = document.getElementById('profile-photo-preview');
        if (preview) {
          preview.src = profile.photo;
          preview.style.display = 'block';
        }
      }

      // Set tags
      if (profile.aboutMe) {
        document.querySelectorAll('#about-me-tags input[type="checkbox"]').forEach(cb => {
          cb.checked = profile.aboutMe.includes(cb.value);
        });
      }

      // Set links
      if (profile.links) {
        Object.keys(profile.links).forEach(key => {
          const input = document.getElementById(`profile-link-${key}`);
          if (input) {
            input.value = profile.links[key] || '';
          }
        });
      }
    }

    if (window.showScreen) {
      window.showScreen('profile-screen');
    }
  },

  // Update online users list
  updateOnlineUsers(users) {
    if (!FEATURES.PHASE2_PROFILES) return;

    const list = document.getElementById('online-users-list');
    if (!list) return;

    // Filter out blocked users
    const visibleUsers = users.filter(user =>
      !gameState.blockedUsers.includes(user.userId) &&
      user.userId !== gameState.userId
    );

    if (visibleUsers.length === 0) {
      list.innerHTML = '<p class="no-users">No other users online</p>';
      return;
    }

    list.innerHTML = visibleUsers.map(user => `
      <div class="online-user-item" data-user-id="${user.userId}">
        ${user.profile?.photo ?
          `<img src="${user.profile.photo}" alt="${user.profile.name}" class="online-user-photo" />` :
          '<div class="online-user-photo-placeholder">👤</div>'
        }
        <div class="online-user-info">
          <div class="online-user-name">${user.profile?.name || 'Anonymous'}</div>
          <div class="online-user-status">${user.status || 'Online'}</div>
        </div>
      </div>
    `).join('');

    // Add click handlers
    list.querySelectorAll('.online-user-item').forEach(item => {
      item.addEventListener('click', () => {
        const userId = item.dataset.userId;
        const user = visibleUsers.find(u => u.userId === userId);
        if (user && user.profile) {
          this.showProfile(userId, user.profile);
        }
      });
    });
  },
};

// Initialize profile system when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ProfileSystem.init());
} else {
  ProfileSystem.init();
}

// Make globally accessible
window.ProfileSystem = ProfileSystem;
