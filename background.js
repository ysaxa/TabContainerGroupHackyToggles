function getCurrentWindowTabs() {
	return browser.tabs.query({currentWindow: true});
}

function getContextualIdentities() {
	return browser.contextualIdentities.query({});
}

function updateButtons() {
	getContextualIdentities().then(identities => getCurrentWindowTabs().then(tabs => {
		let cookieStoreIds = [...new Set(identities.map(i=>i.cookieStoreId).concat('firefox-default'))];
		cookieStoreIds.forEach(cookieStoreId => {
			// add missing buttons
			let url = `tabcontainertoggle://${cookieStoreId}`;
			if (tabs.some(t=>t.cookieStoreId === cookieStoreId) && tabs.every(t=>t.url !== url)) {
				browser.tabs.create({
					active: false,
					url: url,
					cookieStoreId: cookieStoreId,
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
		let split = tab.url.split('//');
		let url = split[0];
		let cookieStoreId = split[1];

		if (url === 'tabcontainertoggle:') {
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
