function getCurrentWindowTabs() {
	return browser.tabs.query({currentWindow: true});
}

function getContextualIdentities() {
	return browser.contextualIdentities.query({});
}

function updateButtons() {
	getContextualIdentities().then(identities => getCurrentWindowTabs().then(tabs => {
		let containers = [...new Set(identities.concat({
			cookieStoreId: 'firefox-default',
			iconUrl: 'resource://usercontext-content/circle.svg',
		}))];
		containers.forEach(container => {
			// add missing buttons
			let url = `./faviconPages/${container.iconUrl.split('/')[3].split('\.')[0]}.html?tabcontainerhackytoggle=${container.cookieStoreId}`;
			if (tabs.some(t=>t.cookieStoreId === container.cookieStoreId) && tabs.every(t=>!t.url.endsWith(url.substring(1)))) {
				browser.tabs.create({
					active: false,
					url: url,
					cookieStoreId: container.cookieStoreId,
					pinned: true,
				});
			}
		});
	}));
}

browser.tabs.onRemoved.addListener(updateButtons);
browser.tabs.onCreated.addListener(function(tab) {
	// updateButtons may create tabs obviously, don't fire this recursively
	// probably if a tab was created pinned, it is not relevant to update buttons
	if (tab.pinned) return;
	setTimeout(updateButtons, 200); // delay to avoid race conditions
});

browser.tabs.onActivated.addListener((activeInfo) => {
	browser.tabs.get(activeInfo.tabId).then(tab => {
		// url looks like moz-extension://f4943e27-1d04-4b64-9071-245498d811f5/testicon.html?tabcontainerhackytoggle=fdssdf
		if (tab.url.startsWith('moz-extension://') && tab.url.includes('tabcontainerhackytoggle=')) {
			let cookieStoreId = tab.url.split('tabcontainerhackytoggle=')[1].split('&')[0];
			console.log(`should toggle ${cookieStoreId}`);
			getCurrentWindowTabs().then(tabs => {
				relevantTabs = tabs.filter(t=>t.cookieStoreId === cookieStoreId).filter(t=>t.id !== activeInfo.tabId);
				let showOrHide = relevantTabs.some(t=>t.hidden) ? browser.tabs.show : browser.tabs.hide;
				showOrHide(relevantTabs.map(t=>t.id)).then(function() {
					browser.tabs.update(activeInfo.previousTabId, {
						active: true,
					});
				});
			});
		}
	});
});
