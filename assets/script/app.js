'use strict';

import { onEvent, select, print } from './utils.js';

const cookieModal = select('.modal');
const messageModal = select('.message-container');
const acceptBtn = select('.accept-btn');
const settingsBtn = select('.settings-btn');
const settingsModal = select('.settings-modal');
const saveSettingsBtn = select('.save-btn');

const cookieBrowser = select('#cookie-browser');
const cookieOs = select('#cookie-os');
const cookieSwidth = select('#cookie-width');
const cookieSheight = select('#cookie-height');

let saveAllCookies = [];

// When the page loads, check all the checkboxes and pre-store the cookies
onEvent(window, 'load', () => {
    cookieBrowser.checked = true;
    cookieOs.checked = true;
    cookieSwidth.checked = true;
    cookieSheight.checked = true;

    // Check if cookies are enabled and if there are any cookies stored
    if (document.cookie.length > 0) {
        print('Cookies set successfully');
        printCookies();
    } else {
        print('No cookies were found');

        const browser = getBrowserName();
        const system = getSystemPlatform();
        const screenWidth = getScreenWidth();
        const screenHeight = getScreenHeight();

        // Pre-store cookies and push them to the saveAllCookies array
        saveAllCookies.push(`Browser: ` + browser);
        saveAllCookies.push(`operatingSystem: ` + system);
        saveAllCookies.push(`screenWidth: ` + screenWidth);
        saveAllCookies.push(`screenHeight: ` + screenHeight);

        // Wait for 2 seconds before displaying the first dialog box
        setTimeout(() => {
            cookieModal.classList.remove('hidden');
            messageModal.classList.remove('hidden');
        }, 2000);
    };
});

// When the user clicks on the accept button, create the cookies and print them
onEvent(acceptBtn, 'click', () => {
    cookieModal.classList.add('hidden');
    messageModal.classList.add('hidden');
    createCookies();
    printCookies();
});

// When the user clicks on the settings button, display the settings modal
onEvent(settingsBtn, 'click', () => {
    messageModal.classList.add('hidden');
    settingsModal.classList.remove('hidden');
});

// When the user clicks on the save settings button, 
// update the saveAllCookies array and create the cookies
onEvent(saveSettingsBtn, 'click', () => {
    cookieModal.classList.add('hidden');
    settingsModal.classList.add('hidden');
    updateSaveAllCookies();
    createCookies();
    printCookies();
});

// Update the saveAllCookies array
function updateSaveAllCookies() {
    const browserValue = cookieBrowser.checked ? getBrowserName() : 'rejected';
    const osValue = cookieOs.checked ? getSystemPlatform() : 'rejected';
    const widthValue = cookieSwidth.checked ? getScreenWidth().toString() : 'rejected';
    const heightValue = cookieSheight.checked ? getScreenHeight().toString() : 'rejected';

    saveAllCookies = [
        `Browser: ${browserValue}`,
        `operatingSystem: ${osValue}`,
        `screenWidth: ${widthValue}`,
        `screenHeight: ${heightValue}`
    ];
}

// Create cookies
function createCookies() {
    const cookiesSet = [];

    saveAllCookies.forEach(cookieInfo => {
        const [cookieName, cookieValue] = cookieInfo.split(': ');

        if (cookieValue.trim() !== 'rejected') {
            setCookie(cookieName.trim(), cookieValue.trim(), { 'max-age': 15 });
            cookiesSet.push(cookieName.trim());
        }
    });

    if (cookiesSet.length === 0) {
        // If no cookies are set, create a special cookie
        setCookie('AllCookiesStatus', 'rejected', { 'max-age': 15 });
    } else {
        // Clear any existing 'AllCookiesStatus' cookie
        deleteCookie('AllCookiesStatus');
    }
}

// Print the cookies
function printCookies() {
    if (document.cookie.length > 0) {
        saveAllCookies.forEach(cookieInfo => {
            const [cookieName] = cookieInfo.split(': ');
            const cookieValue = cookieName.trim();
            const isChecked = isCookieChecked(cookieValue);

            // Check if the cookie is checked and print accordingly
            if (isChecked) {
                print(`${cookieName}: ${getCookie(cookieValue)}`);
            } else {
                print(`${cookieName}: rejected`);
            }
        });
        
        // If all cookies are rejected, display a message
        if (getCookie('AllCookiesStatus') === 'rejected') {
            print('All cookies were rejected');
        }

    } else {
        print('No cookies found');
    }
}

// Check if a cookie is checked
function isCookieChecked(cookieName) {
    switch (cookieName) {
        case 'Browser':
            return cookieBrowser.checked;
        case 'operatingSystem':
            return cookieOs.checked;
        case 'screenWidth':
            return cookieSwidth.checked;
        case 'screenHeight':
            return cookieSheight.checked;
        default:
            return false;
    }
}

// Set cookie
function setCookie(name, value, options = {}) {
    options = {
        path: '/',
        SameSite: 'Lax',
        ...options
    };

    const keys = Object.keys(options);
    const values = Object.values(options);


    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
    }

    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let i = 0; i < keys.length; i++) {
        updatedCookie += `; ${keys[i]}=${values[i]}`;
    }
    document.cookie = updatedCookie;
};

// Get cookie
function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));

    return matches ? decodeURIComponent(matches[1]) : name.includes('rejected') ? 'rejected' : undefined;
}

//Delete cookie
function deleteCookie(name) {
    setCookie(name, '', { 'max-age': -1 });
};

// Get the system platform
function getSystemPlatform() {
    let clientOs = window.navigator.userAgent;
    let finalOs = "";
    if (clientOs.indexOf('Windows') !== -1) {
        finalOs = "Windows";
    }
    else if (clientOs.indexOf('Mac') !== -1) {
        finalOs = "MacOS";
    }
    else if (clientOs.indexOf('Linux') !== -1 && clientOs.indexOf('X11') !== -1) {
        finalOs = "Linux"
    }

    return finalOs;
}

// Get the browser name
function getBrowserName() {
    let clientBrowser = window.navigator.userAgent;
    let finalBrowser = "";
    if (clientBrowser.indexOf('Edg') !== -1) {
        finalBrowser = "Edge";
    }
    else if (clientBrowser.indexOf('Chrome') !== -1) {
        finalBrowser = "Chrome";
    }
    else if (clientBrowser.indexOf('Firefox') !== -1) {
        finalBrowser = "Firefox";
    }

    return finalBrowser;
}

// Get the screen width
function getScreenWidth() {
    return screen.width;
}

// Get the screen height
function getScreenHeight() {
    return screen.height;
}