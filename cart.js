// Plannit Basket & Shopping Cart Management
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Cart
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('plannit_cart') || '[]');
    } catch (e) {
        cart = [];
    }

    // 2. Inject Cart Drawer HTML
    const drawerContainer = document.createElement('div');
    drawerContainer.innerHTML = `
        <div id="cart-drawer-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); z-index: 9999; opacity: 0; pointer-events: none; transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);"></div>
        <div id="cart-drawer" style="position: fixed; top: 0; right: -420px; width: 100%; max-width: 400px; height: 100vh; max-height: 100vh; background: rgba(253, 252, 251, 0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-left: 1px solid rgba(15, 23, 42, 0.08); box-shadow: -10px 0 40px rgba(0,0,0,0.05); z-index: 10000; transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; padding: 2rem; box-sizing: border-box; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--primary); font-family: var(--font-head);">Your Basket</h2>
                <button id="cart-close-btn" style="background: none; border: none; font-size: 2rem; cursor: pointer; color: var(--secondary); display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; hover: background: rgba(15, 23, 42, 0.05); transition: var(--transition);">&times;</button>
            </div>
            
            <!-- Items Area -->
            <div id="cart-items-list" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; padding-right: 0.5rem; scrollbar-width: thin;">
                <!-- Filled dynamically -->
            </div>
            
            <!-- Footer Summary -->
            <div style="border-top: 1px solid rgba(15, 23, 42, 0.08); padding-top: 1.5rem; margin-top: 1.5rem;">
                <!-- Discount Code Box -->
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
                    <input type="text" id="cart-promo-input" placeholder="Promo Code" style="flex: 1; padding: 0.6rem 1rem; border: 1px solid rgba(15, 23, 42, 0.1); border-radius: 50px; font-size: 0.85rem; outline: none; background: #FFF;">
                    <button id="cart-promo-btn" style="padding: 0.6rem 1.2rem; background: var(--primary); color: white; border: none; border-radius: 50px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: var(--transition);">Apply</button>
                </div>
                <div id="cart-promo-message" style="font-size: 0.75rem; font-weight: 600; margin-bottom: 0.75rem; display: none;"></div>

                <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.1rem; margin-bottom: 1.5rem; color: var(--primary);">
                    <span>Total:</span>
                    <span id="cart-total-amount">£0.00</span>
                </div>
                <button id="cart-checkout-btn" style="width: 100%; padding: 0.9rem; background: var(--primary); color: white; border: none; border-radius: 50px; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: var(--transition); box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">Proceed to Checkout</button>
            </div>
        </div>
    `;
    document.body.appendChild(drawerContainer);

    // Style elements lookup
    const overlay = document.getElementById('cart-drawer-overlay');
    const drawer = document.getElementById('cart-drawer');
    const closeBtn = document.getElementById('cart-close-btn');
    const checkoutBtn = document.getElementById('cart-checkout-btn');
    const itemsList = document.getElementById('cart-items-list');
    const totalAmount = document.getElementById('cart-total-amount');

    const promoInput = document.getElementById('cart-promo-input');
    const promoBtn = document.getElementById('cart-promo-btn');
    const promoMsg = document.getElementById('cart-promo-message');

    let appliedDiscount = 0; // 0 = 0%, 1.0 = 100% off

    // Check for saved promo
    const savedPromo = localStorage.getItem('plannit_promo');
    if (savedPromo === 'REDACTED' || savedPromo === 'REDACTED') {
        appliedDiscount = 1.0;
        promoInput.value = savedPromo;
    }

    // Item details mapper
    const itemDetails = {
        'summer-sun': { 
            name: 'Summer Sun Edition', 
            img: '<img src="emojis/sun.svg" style="width: 20px; height: 20px; object-fit: contain;" alt="Summer Sun">' 
        },
        'winter-frost': { 
            name: 'Winter Frost Edition', 
            img: '<img src="emojis/winter.svg" style="width: 20px; height: 20px; object-fit: contain;" alt="Winter Frost">' 
        },
        'autumn-ember': { 
            name: 'Autumn Ember Edition', 
            img: '<img src="emojis/autumn.svg" style="width: 20px; height: 20px; object-fit: contain;" alt="Autumn Ember">' 
        },
        'spring-bloom': { 
            name: 'Spring Bloom Edition', 
            img: '<img src="emojis/spring.svg" style="width: 20px; height: 20px; object-fit: contain;" alt="Spring Bloom">' 
        },
        'seasonal-bundle': { 
            name: 'Full Seasonal Bundle', 
            img: '<i data-lucide="sparkles" class="lucide" style="color: #BA7517; width: 20px; height: 20px;"></i>' 
        },
        'lavender': { 
            name: 'Lavender Edition', 
            img: '<img src="emojis/lavender.svg" style="width: 20px; height: 20px; object-fit: contain;" alt="Lavender">' 
        },
        'eucalyptus': { 
            name: 'Eucalyptus Edition', 
            img: '<img src="emojis/eucalyptus.svg" style="width: 20px; height: 20px; object-fit: contain;" alt="Eucalyptus">' 
        },
        'rose-garden': { 
            name: 'Rose Garden Edition', 
            img: '<img src="emojis/rose.svg" style="width: 20px; height: 20px; object-fit: contain;" alt="Rose">' 
        },
        'wildflower': { 
            name: 'Wildflower Edition', 
            img: '<img src="emojis/wildflower.svg" style="width: 20px; height: 20px; object-fit: contain;" alt="Wildflower">' 
        }
    };

    // Calculate item pricing
    function getItemPrice(slug, mode) {
        if (slug === 'seasonal-bundle') return 14.99;
        return mode === 'subscription' ? 2.49 : 5.99;
    }

    // Toggle drawer visibility
    window.toggleCartDrawer = function(e) {
        if (e) e.stopPropagation();
        const isOpen = drawer.style.right === '0px';
        if (isOpen) {
            drawer.style.right = '-420px';
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
        } else {
            renderCartItems();
            drawer.style.right = '0px';
            overlay.style.opacity = '1';
            overlay.style.pointerEvents = 'auto';
        }
    };

    // Event listeners for close
    overlay.addEventListener('click', () => window.toggleCartDrawer());
    closeBtn.addEventListener('click', () => window.toggleCartDrawer());

    // Update Badge Count
    function updateBadgeCount() {
        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(badge => {
            badge.textContent = cart.length;
            if (cart.length > 0) {
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });
    }

    // Apply promo code logic
    function applyPromoCode() {
        const val = promoInput.value.trim().toUpperCase();
        if (val === 'REDACTED' || val === 'REDACTED') {
            appliedDiscount = 1.0;
            localStorage.setItem('plannit_promo', val);
            promoMsg.textContent = "Master code applied! Total is £0.";
            promoMsg.style.color = "#059669";
            promoMsg.style.display = "block";
            renderCartItems();
        } else if (val === "") {
            appliedDiscount = 0;
            localStorage.removeItem('plannit_promo');
            promoMsg.style.display = "none";
            renderCartItems();
        } else {
            appliedDiscount = 0;
            localStorage.removeItem('plannit_promo');
            promoMsg.textContent = "Invalid promo code.";
            promoMsg.style.color = "#DC2626";
            promoMsg.style.display = "block";
            renderCartItems();
        }
    }

    promoBtn.addEventListener('click', applyPromoCode);
    promoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyPromoCode();
    });

    // Render Cart Items
    function renderCartItems() {
        itemsList.innerHTML = '';
        if (cart.length === 0) {
            itemsList.innerHTML = `
                <div style="text-align: center; color: var(--secondary); padding: 3rem 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem;">
                    <div style="opacity: 0.5; display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px;"><i data-lucide="shopping-bag" style="width: 32px; height: 32px;"></i></div>
                    <p style="font-weight: 500; font-size: 0.95rem;">Your basket is empty.</p>
                </div>
            `;
            totalAmount.textContent = '£0.00';
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.5';
            checkoutBtn.style.cursor = 'not-allowed';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            return;
        }

        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';
        checkoutBtn.style.cursor = 'pointer';

        let total = 0;
        cart.forEach((item, index) => {
            const details = itemDetails[item.slug] || { name: item.slug, img: '<i data-lucide="package" class="lucide" style="width: 20px; height: 20px;"></i>' };
            const price = getItemPrice(item.slug, item.mode);
            total += price;

            const itemRow = document.createElement('div');
            itemRow.className = 'cart-item-row';
            itemRow.style.display = 'flex';
            itemRow.style.alignItems = 'center';
            itemRow.style.gap = '0.75rem';
            itemRow.style.padding = '0.85rem 1rem';
            itemRow.style.background = '#FFFFFF';
            itemRow.style.border = '1px solid rgba(15, 23, 42, 0.06)';
            itemRow.style.borderRadius = '12px';
            itemRow.style.position = 'relative';
            itemRow.style.paddingRight = '2.6rem'; /* space for × badge */
            itemRow.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.4s ease, border-color 0.4s ease, opacity 0.4s ease, height 0.3s ease, padding 0.3s ease, margin 0.3s ease';

            itemRow.innerHTML = `
                <div style="width: 40px; height: 40px; flex-shrink:0; background: var(--bg-alt); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                    ${details.img}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 700; font-size: 0.88rem; color: var(--primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${details.name}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--secondary); text-transform: capitalize; margin-top:2px;">
                        ${item.mode === 'subscription' ? 'Monthly subscription' : 'Lifetime Access'}
                    </div>
                    <div style="font-weight: 700; font-size: 0.88rem; color: var(--primary); margin-top:4px;">
                        £${price.toFixed(2)}
                    </div>
                </div>
                <button
                    class="cart-remove-item"
                    data-index="${index}"
                    title="Remove from basket"
                    style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        width: 22px;
                        height: 22px;
                        border-radius: 50%;
                        background: #FEE2E2;
                        border: 1.5px solid #FECACA;
                        color: #DC2626;
                        font-size: 13px;
                        line-height: 1;
                        font-weight: 700;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0;
                        transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
                    "
                    onmouseover="this.style.background='#DC2626';this.style.color='#fff';this.style.boxShadow='0 0 0 3px rgba(220,38,38,0.25), 0 0 10px rgba(220,38,38,0.35)';this.style.transform='scale(1.15)';"
                    onmouseout="this.style.background='#FEE2E2';this.style.color='#DC2626';this.style.boxShadow='none';this.style.transform='scale(1)';"
                >&times;</button>
            `;
            itemsList.appendChild(itemRow);
        });

        const finalTotal = appliedDiscount === 1.0 ? 0.00 : total;
        totalAmount.textContent = `£${finalTotal.toFixed(2)}`;

        if (appliedDiscount === 1.0) {
            checkoutBtn.textContent = "Claim Free Planners";
            promoMsg.textContent = "Master code applied! Total is £0.";
            promoMsg.style.color = "#059669";
            promoMsg.style.display = "block";
        } else {
            checkoutBtn.textContent = "Proceed to Checkout";
        }

        // Bind remove events
        const removeButtons = itemsList.querySelectorAll('.cart-remove-item');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                const row = btn.closest('.cart-item-row');
                
                if (row) {
                    // Turn red and slide left (Spotify swipe animation)
                    row.style.transform = 'translateX(-120%)';
                    row.style.backgroundColor = '#FEF2F2';
                    row.style.borderColor = '#FCA5A5';
                    row.style.opacity = '0';
                    
                    setTimeout(() => {
                        // Fix explicit height before collapsing
                        const currentHeight = row.clientHeight;
                        row.style.height = currentHeight + 'px';
                        row.style.boxSizing = 'border-box';
                        row.style.overflow = 'hidden';
                        
                        // Collapse smoothly
                        setTimeout(() => {
                            row.style.height = '0px';
                            row.style.paddingTop = '0px';
                            row.style.paddingBottom = '0px';
                            row.style.marginTop = '0px';
                            row.style.marginBottom = '0px';
                            row.style.border = 'none';
                            
                            setTimeout(() => {
                                cart.splice(idx, 1);
                                localStorage.setItem('plannit_cart', JSON.stringify(cart));
                                updateBadgeCount();
                                renderCartItems();
                            }, 300);
                        }, 10);
                    }, 350);
                } else {
                    cart.splice(idx, 1);
                    localStorage.setItem('plannit_cart', JSON.stringify(cart));
                    updateBadgeCount();
                    renderCartItems();
                }
            });
        });
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Global helper to add items
    window.addItemToCart = function(slug, mode) {
        // Prevent duplicate items with same mode
        const exists = cart.some(item => item.slug === slug && item.mode === mode);
        if (!exists) {
            cart.push({ slug, mode });
            localStorage.setItem('plannit_cart', JSON.stringify(cart));
            updateBadgeCount();
        }
        window.toggleCartDrawer();
    };

    // Attach click handler to Checkout Button
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        
        if (appliedDiscount === 1.0) {
            // Free checkout bypass immediately
            checkoutBtn.textContent = "Unlocking library...";
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = "0.7";

            let owned = [];
            try {
                owned = JSON.parse(localStorage.getItem('plannit_owned') || '[]');
            } catch (e) {
                owned = [];
            }

            cart.forEach(item => {
                if (!owned.includes(item.slug)) {
                    owned.push(item.slug);
                }
            });

            localStorage.setItem('plannit_owned', JSON.stringify(owned));
            localStorage.removeItem('plannit_cart');
            localStorage.removeItem('plannit_promo');

            setTimeout(() => {
                window.location.href = 'library.html?checkout_success=true';
            }, 1200);
        } else {
            // Close drawer first
            const isOpen = drawer.style.right === '0px';
            if (isOpen) {
                window.toggleCartDrawer();
            }
            
            // Show secure loading transition overlay
            const loaderOverlay = document.getElementById('checkout-loader-overlay');
            if (loaderOverlay) {
                loaderOverlay.style.display = 'flex';
                // Trigger transition in
                setTimeout(() => {
                    loaderOverlay.style.opacity = '1';
                    loaderOverlay.style.pointerEvents = 'auto';
                }, 10);
                
                const emblems = loaderOverlay.querySelectorAll('.loader-emblem');
                let idx = 0;
                function animateLoader() {
                    emblems.forEach(e => {
                        e.style.opacity = '0';
                        e.style.transform = 'scale(0.8)';
                    });
                    if (idx < emblems.length) {
                        emblems[idx].style.opacity = '1';
                        emblems[idx].style.transform = 'scale(1)';
                        idx++;
                        setTimeout(animateLoader, 300);
                    } else {
                        // Redirect directly (checkout.html has its own fade-in animation)
                        window.location.href = 'checkout.html';
                    }
                }
                setTimeout(animateLoader, 150);
            } else {
                window.location.href = 'checkout.html';
            }
        }
    });

    // Global helper to sync cart across pages/updates (Batch 3)
    window.syncCart = function() {
        try {
            cart = JSON.parse(localStorage.getItem('plannit_cart') || '[]');
        } catch (e) {
            cart = [];
        }
        updateBadgeCount();
        renderCartItems();
    };

    // Initialize counts on load
    updateBadgeCount();

    // 3. Inject Profile Dropdown HTML next to the Shop button
    const shopBtn = document.querySelector('.nav-shop');
    if (shopBtn) {
        const profileContainer = document.createElement('div');
        profileContainer.className = 'nav-profile-wrap';
        profileContainer.style.position = 'relative';
        profileContainer.style.display = 'inline-block';
        profileContainer.style.verticalAlign = 'middle';

        profileContainer.innerHTML = `
            <div class="nav-profile-btn" id="nav-profile-btn" style="cursor: pointer; position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: var(--bg-alt); border: 1px solid var(--border); transition: all 0.2s ease; color: var(--secondary);" onmouseover="this.style.borderColor='var(--border-hover)'; this.style.color='var(--primary)'; this.style.background='white';" onmouseout="this.style.borderColor='var(--border)'; this.style.color='var(--secondary)'; this.style.background='var(--bg-alt)';">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span class="profile-status-dot" id="profile-status-dot" style="position: absolute; bottom: 2px; right: 2px; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; background: #94A3B8; display: block; transition: background-color 0.3s ease;"></span>
            </div>
            
            <div class="profile-dropdown" id="profile-dropdown" style="display: none; position: absolute; top: 48px; right: 0; background: rgba(253, 252, 251, 0.98); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(15,23,42,0.08); border-radius: 16px; box-shadow: 0 12px 30px rgba(0,0,0,0.15); padding: 1.25rem; width: 240px; z-index: 10000; flex-direction: column; gap: 0.75rem;">
                <div id="profile-dropdown-unauth" style="display: flex; flex-direction: column; gap: 0.75rem; text-align: center;">
                    <p style="font-size: 0.8rem; color: var(--secondary); margin: 0; line-height: 1.4;">Sign in to sync your library and access your templates.</p>
                    <a href="auth.html?mode=login" style="display: block; padding: 0.6rem 1rem; background: var(--primary); color: white; border-radius: 50px; text-decoration: none; font-size: 0.85rem; font-weight: 600; text-align: center; transition: var(--transition);">Sign In / Sign Up</a>
                </div>
                <div id="profile-dropdown-auth" style="display: none; flex-direction: column; gap: 0.75rem;">
                    <div id="profile-dropdown-display-name" style="font-size: 0.75rem; color: var(--secondary); word-break: break-all; line-height: 1.4;">
                        <!-- Filled dynamically -->
                    </div>
                    <hr style="border: 0; border-top: 1px solid rgba(15,23,42,0.08); margin: 0;">
                    <a href="library.html" style="display: flex; align-items: center; gap: 10px; color: var(--primary); text-decoration: none; font-size: 0.85rem; font-weight: 600; padding: 0.6rem 0.75rem; border-radius: 8px; transition: all 0.2s ease;" onmouseover="this.style.background='rgba(15,23,42,0.05)'" onmouseout="this.style.background='transparent'">
                        <i data-lucide="key" class="lucide" style="width: 14px; height: 14px;"></i> My Library
                    </a>
                    <button id="profile-signout-btn" style="width: 100%; display: flex; align-items: center; gap: 10px; color: #DC2626; background: transparent; border: none; font-size: 0.85rem; font-weight: 600; padding: 0.6rem 0.75rem; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; text-align: left; outline: none; font-family: inherit;" onmouseover="this.style.background='rgba(220, 38, 38, 0.08)'" onmouseout="this.style.background='transparent'">
                        <i data-lucide="log-out" class="lucide" style="width: 14px; height: 14px;"></i> Sign Out
                    </button>
                </div>
            </div>
        `;
        
        // Insert right after the shop link
        shopBtn.parentNode.insertBefore(profileContainer, shopBtn.nextSibling);

        // Wire up toggle logic
        const profileBtn = document.getElementById('nav-profile-btn');
        const dropdown = document.getElementById('profile-dropdown');
        const statusDot = document.getElementById('profile-status-dot');
        const unauthDiv = document.getElementById('profile-dropdown-unauth');
        const authDiv = document.getElementById('profile-dropdown-auth');
        const displayNameContainer = document.getElementById('profile-dropdown-display-name');
        const signoutBtn = document.getElementById('profile-signout-btn');

        function updateProfileUI() {
            const email = localStorage.getItem('plannit_user_email');
            if (email) {
                statusDot.style.background = '#10B981'; // Green dot
                unauthDiv.style.display = 'none';
                authDiv.style.display = 'flex';
                
                const firstName = localStorage.getItem('plannit_first_name') || '';
                const lastName = localStorage.getItem('plannit_last_name') || '';
                const fullName = (firstName + ' ' + lastName).trim();
                const displayName = fullName || email;
                
                displayNameContainer.innerHTML = `Signed in as:<br><strong style="color: var(--primary); font-size: 0.82rem;">${displayName}</strong>`;
            } else {
                statusDot.style.background = '#94A3B8'; // Gray dot
                unauthDiv.style.display = 'flex';
                authDiv.style.display = 'none';
                displayNameContainer.innerHTML = '';
            }
        }

        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.style.display === 'flex';
            dropdown.style.display = isOpen ? 'none' : 'flex';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Signout logic
        signoutBtn.addEventListener('click', () => {
            localStorage.removeItem('plannit_user_email');
            localStorage.removeItem('plannit_email'); // Clean duplicate key too
            localStorage.removeItem('plannit_first_name');
            localStorage.removeItem('plannit_last_name');
            localStorage.removeItem('plannit_username');
            window.location.reload();
        });

        updateProfileUI();
    }

    // 4. Inject Discord Toast HTML for 'Discord Coming Soon' notice
    const toast = document.createElement('div');
    toast.id = 'discord-toast';
    toast.style.cssText = 'display: none; position: fixed; bottom: 24px; right: 24px; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 1rem 1.5rem; color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 100000; align-items: center; gap: 10px; font-size: 0.88rem; transition: opacity 0.3s ease, transform 0.3s ease; transform: translateY(20px); opacity: 0; font-family: "Inter", sans-serif; pointer-events: none;';
    toast.innerHTML = `
        <span style="font-size: 1.25rem; display: inline-flex; align-items: center; justify-content: center;"><i data-lucide="message-square" style="color: #5865F2; width: 20px; height: 20px;"></i></span>
        <span style="display: inline-flex; align-items: center; gap: 6px;">The Plannit Discord community is coming soon! Stay tuned. <i data-lucide="rocket" style="width: 14px; height: 14px;"></i></span>
    `;
    document.body.appendChild(toast);

    // 5. Inject Checkout Loader Overlay HTML (for premium transitions)
    const loaderOverlay = document.createElement('div');
    loaderOverlay.id = 'checkout-loader-overlay';
    loaderOverlay.style.cssText = 'position: fixed; inset: 0; background: var(--bg); display: none; flex-direction: column; align-items: center; justify-content: center; z-index: 100000; opacity: 0; pointer-events: none; transition: opacity 0.35s ease-in-out; font-family: "Inter", sans-serif;';
    loaderOverlay.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; width: 120px; height: 120px; position: relative;">
            <div class="loader-emblem" data-emb="summer" style="opacity: 0; transform: scale(0.8); transition: all 0.3s ease; position: absolute;"><svg class="svg-icon spin-slow" viewBox="0 0 24 24" style="color: #F5A623; width: 64px; height: 64px; fill: none; stroke: currentColor; stroke-width: 1.75px; stroke-linecap: round; stroke-linejoin: round;"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg></div>
            <div class="loader-emblem" data-emb="winter" style="opacity: 0; transform: scale(0.8); transition: all 0.3s ease; position: absolute;"><svg class="svg-icon spin-slow" viewBox="0 0 24 24" style="color: #85B7EB; width: 64px; height: 64px; fill: none; stroke: currentColor; stroke-width: 1.75px; stroke-linecap: round; stroke-linejoin: round;"><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/><path d="m20 16-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4"/></svg></div>
            <div class="loader-emblem" data-emb="autumn" style="opacity: 0; transform: scale(0.8); transition: all 0.3s ease; position: absolute;"><svg class="svg-icon sway-subtle" viewBox="0 0 24 24" style="color: #E8593C; width: 64px; height: 64px; fill: none; stroke: currentColor; stroke-width: 1.75px; stroke-linecap: round; stroke-linejoin: round;"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 5.5a7 7 0 0 1-10 12.5z"/><path d="M19 2c-2.26 4.33-5.27 7.14-8 10"/></svg></div>
            <div class="loader-emblem" data-emb="spring" style="opacity: 0; transform: scale(0.8); transition: all 0.3s ease; position: absolute;"><svg class="svg-icon pulse-subtle" viewBox="0 0 24 24" style="color: #D4537E; width: 64px; height: 64px; fill: none; stroke: currentColor; stroke-width: 1.75px; stroke-linecap: round; stroke-linejoin: round;"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 0 4.5 4.5M7.5 12H9m7.5 0a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5H15m-3 4.5V15"/><circle cx="12" cy="12" r="3"/></svg></div>
        </div>
        <div style="margin-top: 2rem; font-size: 0.85rem; font-weight: 600; color: var(--secondary); text-transform: uppercase; letter-spacing: 0.1em;" id="checkout-loader-text">Preparing Secure Checkout...</div>
    `;
    document.body.appendChild(loaderOverlay);

    window.showDiscordNotice = function(e) {
        if (e) e.preventDefault();
        const toastEl = document.getElementById('discord-toast');
        if (toastEl) {
            toastEl.style.display = 'flex';
            setTimeout(() => {
                toastEl.style.opacity = '1';
                toastEl.style.transform = 'translateY(0)';
            }, 10);
            
            // Clear any active timers on this element to prevent overlapping
            if (window.discordToastTimeout) clearTimeout(window.discordToastTimeout);
            if (window.discordToastHideTimeout) clearTimeout(window.discordToastHideTimeout);

            window.discordToastTimeout = setTimeout(() => {
                toastEl.style.opacity = '0';
                toastEl.style.transform = 'translateY(20px)';
                window.discordToastHideTimeout = setTimeout(() => {
                    toastEl.style.display = 'none';
                }, 300);
            }, 3000);
        }
    };

    // Smooth page-out animation for all internal nav links (supporting query parameters)
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#') && !link.target) {
            // Check if target is an internal .html file path
            const cleanHref = href.split('?')[0].split('#')[0];
            if (cleanHref.endsWith('.html')) {
                link.addEventListener('click', (e) => {
                    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                    const targetPage = cleanHref;
                    
                    // Skip transition if navigating to same page hash
                    if (targetPage === currentPage) {
                        return;
                    }
                    
                    e.preventDefault();
                    document.body.style.transition = 'opacity 0.35s ease-out, transform 0.35s ease-out';
                    document.body.style.opacity = '0';
                    document.body.style.transform = 'translateY(-8px)';
                    setTimeout(() => {
                        window.location.href = href;
                    }, 350);
                });
            }
        }
    });

    // Initialize Lucide Icons across the page
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
