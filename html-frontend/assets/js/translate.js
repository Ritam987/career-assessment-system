// =============================================================
// translate.js — Google Translate Integration
// Seamlessly translates the page when the language dropdown changes
// =============================================================

function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,hi,bn', // English, Hindi, Bengali
        autoDisplay: false
    }, 'google_translate_element');
}

// Override any existing changeLanguage functions on the page
window.changeLanguage = function(lang) {
    // 1. Save preference locally
    localStorage.setItem('cas_lang', lang);
    
    // 2. Set the Google Translate cookie
    // The format is /auto/TARGET_LANG or /PAGE_LANG/TARGET_LANG
    const cookieString = `googtrans=/en/${lang}; path=/`;
    document.cookie = cookieString;
    
    // Set for current domain as well to ensure it sticks
    const domainCookieString = `googtrans=/en/${lang}; domain=${window.location.hostname}; path=/`;
    document.cookie = domainCookieString;

    // 3. Reload the page to apply the translation
    window.location.reload();
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Create hidden div for Google Translate widget
    const gtDiv = document.createElement('div');
    gtDiv.id = 'google_translate_element';
    gtDiv.style.display = 'none';
    document.body.appendChild(gtDiv);

    // 2. Load the Google Translate API script
    const script = document.createElement('script');
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(script);

    // 3. Inject CSS to hide Google Translate UI elements (top bar, tooltips)
    const style = document.createElement('style');
    style.textContent = `
        /* Hide the Google Translate toolbar */
        .skiptranslate iframe { display: none !important; }
        body { top: 0 !important; }
        
        /* Hide hover tooltips and popups */
        #goog-gt-tt { display: none !important; visibility: hidden !important; }
        .goog-tooltip { display: none !important; }
        .goog-tooltip:hover { display: none !important; }
        .goog-te-balloon-frame { display: none !important; }
        
        /* Remove the highlight background on hover */
        .goog-text-highlight { 
            background-color: transparent !important; 
            border: none !important; 
            box-shadow: none !important; 
        }
    `;
    document.head.appendChild(style);

    // 4. Sync all language dropdowns on the page with the current active language
    const currentLang = localStorage.getItem('cas_lang') || 'en';
    document.querySelectorAll('select').forEach(select => {
        const onChangeAttr = select.getAttribute('onchange');
        if (onChangeAttr && onChangeAttr.includes('changeLanguage')) {
            select.value = currentLang;
        }
    });
});
