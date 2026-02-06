// Profile System using Supabase (Replaces LocalStorage)
const ProfileSystem = {
    supabase: null,
    user: null,

    init() {
        if (!APP_CONFIG.FEATURES.PHASE2_PROFILES) {
             const elementsToHide = ['show-online-users-btn', 'edit-profile-btn', 'online-users-sidebar'];
             elementsToHide.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
             });
             return;
        }

        // Initialize Supabase
        console.log("Initializing Supabase...");
        if (window.supabase) {
            try {
                this.supabase = window.supabase.createClient(APP_CONFIG.SUPABASE_URL, APP_CONFIG.SUPABASE_KEY);
                console.log("Supabase client created successfully");
            } catch (err) {
                console.error("Failed to create Supabase client:", err);
                alert("Critical Error: Supabase configuration is invalid. Check console.");
            }
        } else {
            console.error("Supabase script not loaded on window object");
            alert("Critical Error: Supabase library not loaded. Check internet connection or ad blockers.");
            return;
        }

        this.setupEventListeners();

        // Listen for auth changes (Handle initial session and subsequent sign-ins)
        this.supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth State Change:", event);
            if (session) {
                this.user = session.user;
                gameState.userId = this.user.id;

                // Hide auth, show profile
                if (document.getElementById('auth-section')) {
                     document.getElementById('auth-section').style.display = 'none';
                     document.getElementById('profile-setup-section').style.display = 'block';
                }

                this.loadProfile();
            } else {
                this.user = null;
                if (document.getElementById('auth-section')) {
                     document.getElementById('auth-section').style.display = 'block';
                     document.getElementById('profile-setup-section').style.display = 'none';
                }
            }
        });
    },

    setupEventListeners() {
        // Auth Buttons
        const signinBtn = document.getElementById('auth-signin-btn');
        const signupBtn = document.getElementById('auth-signup-btn');

        // Pass event object to handlers
        if (signinBtn) signinBtn.addEventListener('click', (e) => this.handleSignIn(e));
        if (signupBtn) signupBtn.addEventListener('click', (e) => this.handleSignUp(e));

        // Profile Buttons
        const saveProfileBtn = document.getElementById('save-profile-btn');
        if (saveProfileBtn) saveProfileBtn.addEventListener('click', () => this.saveProfile());

        const profilePhoto = document.getElementById('profile-photo');
        if (profilePhoto) profilePhoto.addEventListener('change', (e) => this.handlePhotoUpload(e));

        // Other existing listeners
        const showOnlineUsersBtn = document.getElementById('show-online-users-btn');
        if (showOnlineUsersBtn) showOnlineUsersBtn.addEventListener('click', () => {
             document.getElementById('online-users-sidebar')?.classList.remove('hidden');
        });

        const closeOnlineUsersBtn = document.getElementById('toggle-online-users');
        if (closeOnlineUsersBtn) closeOnlineUsersBtn.addEventListener('click', () => {
            document.getElementById('online-users-sidebar')?.classList.add('hidden');
        });

         const closeProfileModal = document.getElementById('close-profile-modal');
        if (closeProfileModal) closeProfileModal.addEventListener('click', () => this.closeProfileModal());

        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) editProfileBtn.addEventListener('click', () => this.editProfile());
    },

    async handleSignIn(e) {
        if(e) e.preventDefault();

        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const errorEl = document.getElementById('auth-error');

        if (!email || !password) {
            errorEl.textContent = "Please enter email and password";
            errorEl.style.display = "block";
            return;
        }

        errorEl.style.display = 'none';

        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error("Sign In Error:", error);
            errorEl.textContent = error.message;
            errorEl.style.display = "block";
            errorEl.style.color = "#ff5252";
        }
        // Success is handled by onAuthStateChange
    },

    async handleSignUp(e) {
        console.log("handleSignUp called"); // Verify function is called
        // Re-enable button explicitly if needed
        if(e) e.preventDefault();

        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const errorEl = document.getElementById('auth-error');

        if (!email || !password) {
            errorEl.textContent = "Please enter email and password";
            errorEl.style.display = "block";
            return;
        }

        errorEl.style.display = 'none';

        const { data, error } = await this.supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            console.error("Sign Up Error:", error);
            errorEl.textContent = error.message;
            errorEl.style.display = "block";
            errorEl.style.color = "#ff5252";
        } else if (data && !data.session) {
            // Success but email confirmation required
            errorEl.textContent = "Sign up successful! Please check your email for the confirmation link.";
            errorEl.style.color = "#4CAF50"; // Green
            errorEl.style.display = "block";
        }
        // If data.session exists, onAuthStateChange will handle it
    },

    showProfileSetup() {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('profile-setup-section').style.display = 'block';
    },

   async loadProfile() {
       if (!this.user) return null;

       const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', this.user.id)
        .single();

       if (data) {
           gameState.profile = {
               name: data.display_name,
               photo: data.avatar_url, // URL or base64
               age: data.age_range,
               orientation: data.orientation,
               aboutMe: data.about_me || [],
               links: data.social_links || {}
           };
           // If we have a profile, we can probably proceed to lobby?
           // Or just pre-fill the form
           return gameState.profile;
       }
       return null;
    },

    async saveProfile() {
        if (!this.user) return;

        const profileData = {
            id: this.user.id,
            display_name: document.getElementById('profile-name')?.value.trim() || 'Anonymous',
            // For photo, we should technically upload to storage, but for now we might still keep base64
            // if the user used the file input, stored in gameState.profile.photo temp
            avatar_url: gameState.profile?.photo || null,
            age_range: document.getElementById('profile-age')?.value || '',
            orientation: document.getElementById('profile-orientation')?.value || '',
            about_me: this.getSelectedTags(),
            social_links: {
                x: document.getElementById('profile-link-x')?.value.trim() || '',
                bluesky: document.getElementById('profile-link-bluesky')?.value.trim() || '',
                bateworld: document.getElementById('profile-link-bateworld')?.value.trim() || '',
                discord: document.getElementById('profile-link-discord')?.value.trim() || '',
                telegram: document.getElementById('profile-link-telegram')?.value.trim() || '',
                fetlife: document.getElementById('profile-link-fetlife')?.value.trim() || '',
                reddit: document.getElementById('profile-link-reddit')?.value.trim() || '',
            },
            updated_at: new Date()
        };

            console.log("Saving profile data:", profileData);

        const { error } = await this.supabase
            .from('profiles')
            .upsert(profileData);

        if (error) {
            console.error("Error saving profile:", error);
            alert("Error saving profile: " + error.message);
        } else {
            gameState.profile = {
                name: profileData.display_name,
                photo: profileData.avatar_url,
                age: profileData.age_range,
                orientation: profileData.orientation,
                aboutMe: profileData.about_me,
                links: profileData.social_links
            };

            // Proceed to lobby
            if (window.showScreen) window.showScreen('lobby-screen');
        }
    },

    getSelectedTags() {
        const checkboxes = document.querySelectorAll('#about-me-tags input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    },

    async handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Preview locally first for immediate feedback
        const preview = document.getElementById('profile-photo-preview');
        const placeholder = document.getElementById('photo-placeholder');

        // Show local preview
        const reader = new FileReader();
        reader.onload = (e) => {
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
            if (placeholder) placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);

        // Upload to Supabase Storage
        if (!this.user) return; // Should be logged in

        const fileExt = file.name.split('.').pop();
        const fileName = `${this.user.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { data, error } = await this.supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (error) throw error;

            // Get Public URL
            const { data: { publicUrl } } = this.supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            console.log("Uploaded photo:", publicUrl);

            if (!gameState.profile) gameState.profile = {};
            gameState.profile.photo = publicUrl;

            // Also update the preview to ensure it loads from remote source eventually?
            // Better stick to local reader for speed, but store URL for saveProfile.

        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Error uploading photo: ' + error.message);
        }
    },

    // UI Helpers for Profile Modal (View other users)
    showProfile(userId, profile) {
         if (!APP_CONFIG.FEATURES.PHASE2_PROFILES) return;
         const modal = document.getElementById('profile-view-modal');
         const content = document.getElementById('profile-view-content');

         if (!modal || !content) return;
         modal.dataset.viewedUserId = userId; // Just for context, though friends/block might be different now

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
         modal.classList.remove('hidden');
    },

    buildProfileLinks(links) {
        if (!links || Object.keys(links).length === 0) return '';
        const linkLabels = { x: 'X', bluesky: 'Bluesky', bateworld: 'Bateworld', discord: 'Discord', telegram: 'Telegram', fetlife: 'Fetlife', reddit: 'Reddit' };
        const linkItems = Object.entries(links).filter(([k,v]) => v && v.trim()).map(([k,v]) => {
            // ... (Same URL building logic)
             let url = v;
            if (k === 'discord' && !v.startsWith('http')) url = `https://discord.com/users/${v}`;
            else if (k === 'telegram' && !v.startsWith('http')) url = `https://t.me/${v.replace('@', '')}`;
            return `<a href="${url}" target="_blank">${linkLabels[k]}</a>`;
        }).join(' | ');
        return linkItems ? `<div class="profile-links"><strong>Links:</strong> ${linkItems}</div>` : '';
    },

    closeProfileModal() {
        document.getElementById('profile-view-modal')?.classList.add('hidden');
    },

    updateOnlineUsers(users) {
        const list = document.getElementById('online-users-list');
        if (!list) return;
        // Basic rendering
        const visibleUsers = users.filter(u => u.userId !== gameState.userId); // Add block filter later
        if (visibleUsers.length === 0) {
            list.innerHTML = '<p class="no-users">No other users online</p>';
            return;
        }
        list.innerHTML = visibleUsers.map(user => `
            <div class="online-user-item" onclick="ProfileSystem.showProfile('${user.userId}', ${JSON.stringify(user.profile).replace(/"/g, '&quot;')})">
                 <div class="online-user-photo-placeholder">👤</div>
                 <div class="online-user-info">
                    <div class="online-user-name">${user.profile?.name || 'Anonymous'}</div>
                    <div class="online-user-status">${user.status || 'Online'}</div>
                 </div>
            </div>
        `).join('');
    },

    editProfile() {
        this.showProfileSetup();
        // Load data into form...
        // (Simplified for now - assumes data stays in inputs or state)
        if (window.showScreen) window.showScreen('profile-screen');
    }
};

window.ProfileSystem = ProfileSystem;
document.addEventListener('DOMContentLoaded', () => ProfileSystem.init());
