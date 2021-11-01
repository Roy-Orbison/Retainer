/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/
 *
 * © 2017 Jonathan Kingston
 * © 2021 Roy Orbison
 * */

class WindowContainers {
	set(tab) {
		if (
			tab.cookieStoreId
			&& tab.windowId
			&& tab.cookieStoreId !== containerNone
		) {
			this[tab.windowId] = tab.cookieStoreId;
		}
	}
}

const containers = new WindowContainers;
const containerNone = 'firefox-default';


browser.windows.onRemoved.addListener(windowId => delete containers[windowId]);

(async function() {
	try {
		const actives = await browser.tabs.query({
			active: true
		});
		if (actives?.length) {
			actives.forEach(async function(tab) {
				if (tab.windowId && tab.cookieStoreId == containerNone) {
					const others = await browser.tabs.query({
						windowId: tab.windowId
					});
					if (others?.length) {
						let counts = {},
							stable = [];
						others.forEach(tabOther => {
							if (tabOther.cookieStoreId && tabOther.cookieStoreId != containerNone) {
								stable[tabOther.index] = tabOther.cookieStoreId
								if (counts[tabOther.cookieStoreId]) {
									counts[tabOther.cookieStoreId].count++;
								}
								else {
									counts[tabOther.cookieStoreId] = {
										count: 1,
										oneOf: tabOther
									};
								}
							}
						});
						if (stable.length) {
							stable = stable.reduce((containerLast, containerCurrent) =>
								containerLast
								&& (
									!containerCurrent
									|| counts[containerLast].count > counts[containerCurrent].count
								) ?
									containerLast :
									containerCurrent);
							tab = counts[stable].oneOf;
						}
					}
				}
				containers.set(tab);
			});
		}
	}
	catch (error) {
	}
})();

browser.tabs.onActivated.addListener(async function(activeInfo) {
	try {
		const tab = await browser.tabs.get(activeInfo.tabId);
		containers.set(tab);
	}
	catch (error) {
	}
});

browser.commands.onCommand.addListener(async function(command) {
	if (command === 'retainer-tab') {
		try {
			const tabs = await browser.tabs.query({
				currentWindow: true,
				active: true
			});
			if (tabs?.length && tabs[0].id != browser.tabs.TAB_ID_NONE) {
				const exclKey = 'excludeDefault',
					res = await browser.storage.sync.get(exclKey),
					excl = +(res && res[exclKey] || 0),
					mruCookieStoreId = containers[tabs[0].windowId];
				if (excl < 2 || mruCookieStoreId) {
					browser.tabs.create({
						cookieStoreId: excl && mruCookieStoreId || tabs[0].cookieStoreId
					});
				}
			}
		}
		catch (error) {
		}
	}
});
