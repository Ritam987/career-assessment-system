const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' }
];

let localize;

i18next
    .use(i18nextHttpBackend)
    .use(i18nextBrowserLanguageDetector)
    .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'hi', 'bn', 'ta', 'te'],
        ns: ['admin', 'common', 'validation', 'messages'],
        defaultNS: 'admin',
        backend: {
            loadPath: '/admin/locales/{{lng}}/{{ns}}.json',
        },
        detection: {
            order: ['localStorage', 'cookie', 'navigator'],
            caches: ['localStorage', 'cookie'],
            lookupLocalStorage: 'adminLanguage',
            lookupCookie: 'cas_lang' // Keep in sync with user side translation
        }
    }).then(() => {
        // Init DOM localizer
        localize = locI18next.init(i18next, {
            selectorAttr: 'data-i18n'
        });
        
        translateAll();
        injectLanguageSelector();
    });

window.translateAll = translateAll;
function translateAll() {
    localize('[data-i18n]');
    
    // Also handle dynamic placeholders which loc-i18next might miss by default 
    // depending on configuration, though it usually handles it if configured via attributes.
    // We explicitly requested data-i18n-placeholder and data-i18n-title.
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.setAttribute('placeholder', i18next.t(el.getAttribute('data-i18n-placeholder')));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        el.setAttribute('title', i18next.t(el.getAttribute('data-i18n-title')));
    });
}

function injectLanguageSelector() {
    if (document.getElementById('adminLangSelector')) return;
    
    const sel = document.createElement('select');
    sel.id = 'adminLangSelector';
    sel.className = 'form-select form-select-sm ms-2 me-2';
    sel.style.width = 'auto';
    sel.style.display = 'inline-block';
    sel.style.cursor = 'pointer';
    sel.style.borderRadius = '8px';
    
    SUPPORTED_LANGUAGES.forEach(lang => {
        const opt = document.createElement('option');
        opt.value = lang.code;
        opt.textContent = lang.name;
        if (i18next.resolvedLanguage === lang.code) opt.selected = true;
        sel.appendChild(opt);
    });
    
    const topbarRight = document.querySelector('.topbar-right');
    if (topbarRight) {
        topbarRight.insertBefore(sel, topbarRight.firstChild);
    } else {
        const lw = document.createElement('div');
        lw.style.position = 'absolute';
        lw.style.top = '15px';
        lw.style.right = '15px';
        lw.appendChild(sel);
        document.body.appendChild(lw);
    }
    
    sel.addEventListener('change', async (e) => {
        const lang = e.target.value;
        await i18next.changeLanguage(lang);
        
        // Update user side Google translate cookie manually to stay synced
        document.cookie = 'googtrans=/en/' + lang + '; path=/';
        document.cookie = 'googtrans=/en/' + lang + '; domain=' + window.location.hostname + '; path=/';
        
        // Re-translate current DOM
        translateAll();
        
        // Re-render sidebar if it exists
        if (typeof buildSidebar === 'function') {
            const nav = document.getElementById('sidebarNav');
            if (nav) {
                nav.innerHTML = buildSidebar();
                translateAll(); // Re-translate new sidebar
            }
        }
        
        // Fire custom event so charts and dynamic JS can re-render
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    });
}
