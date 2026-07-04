/**
 * Plannit Cookie Consent Banner
 * Dynamically renders a premium, responsive cookie consent overlay
 * using Plannit brand aesthetics.
 */
document.addEventListener("DOMContentLoaded", () => {
    // Check if user already consented
    const consent = localStorage.getItem("plannit_cookie_consent");
    if (consent) return;

    // Create style element for the banner
    const style = document.createElement("style");
    style.textContent = `
        .cookie-banner-wrapper {
            position: fixed;
            bottom: 24px;
            right: 24px;
            max-width: 420px;
            background: rgba(253, 252, 251, 0.9);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(186, 117, 23, 0.15);
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
            z-index: 99999;
            transform: translateY(100px);
            opacity: 0;
            transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .cookie-banner-wrapper.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .cookie-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .cookie-text {
            font-size: 0.88rem;
            line-height: 1.5;
            color: #64748b;
            margin-bottom: 1.25rem;
        }
        
        .cookie-text a {
            color: #ba7517;
            text-decoration: underline;
            font-weight: 500;
        }
        
        .cookie-actions {
            display: flex;
            gap: 0.75rem;
        }
        
        .cookie-btn {
            flex: 1;
            padding: 0.65rem 1rem;
            font-size: 0.85rem;
            font-weight: 600;
            border-radius: 50px;
            border: 1px solid transparent;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
        }
        
        .cookie-btn.accept {
            background: #ba7517;
            color: white;
        }
        
        .cookie-btn.accept:hover {
            background: #a3610f;
            transform: translateY(-1px);
        }
        
        .cookie-btn.decline {
            background: transparent;
            border-color: #cbd5e1;
            color: #64748b;
        }
        
        .cookie-btn.decline:hover {
            background: rgba(15, 23, 42, 0.03);
            border-color: #94a3b8;
        }

        @media (max-width: 500px) {
            .cookie-banner-wrapper {
                bottom: 16px;
                left: 16px;
                right: 16px;
                max-width: none;
            }
        }
    `;
    document.head.appendChild(style);

    // Create banner container
    const banner = document.createElement("div");
    banner.className = "cookie-banner-wrapper";
    banner.innerHTML = `
        <div class="cookie-title" style="display: flex; align-items: center; gap: 8px;">
            <img src="emojis/cookie.svg" class="emoji-svg" style="width: 20px; height: 20px;" alt=""> Cookie & Privacy Settings
        </div>
        <div class="cookie-text">
            We use cookies and local storage to keep you signed in, manage your purchased planner library, and securely process payments. Learn more in our <a href="privacy.html">Privacy Policy</a>.
        </div>
        <div class="cookie-actions">
            <button class="cookie-btn decline" id="declineCookies">Essential Only</button>
            <button class="cookie-btn accept" id="acceptCookies">Accept All</button>
        </div>
    `;
    document.body.appendChild(banner);

    // Trigger sliding animation
    setTimeout(() => {
        banner.classList.add("show");
    }, 500);

    // Handle acceptance
    document.getElementById("acceptCookies").addEventListener("click", () => {
        localStorage.setItem("plannit_cookie_consent", "accepted");
        dismissBanner();
    });

    // Handle rejection of non-essential
    document.getElementById("declineCookies").addEventListener("click", () => {
        localStorage.setItem("plannit_cookie_consent", "essential");
        dismissBanner();
    });

    function dismissBanner() {
        banner.classList.remove("show");
        setTimeout(() => {
            banner.remove();
        }, 500);
    }
});
