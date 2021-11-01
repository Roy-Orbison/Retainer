/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/
 *
 * © 2021 Roy Orbison
 * */

const excludeRadio = document.forms.prefs.elements.restriction,
	exclKey = 'excludeDefault',
	store = browser.storage.sync;

store.get(exclKey).then(res => {
	excludeRadio.forEach(option => {
		option.disabled = false;
		option.checked = option.value == +(res && res[exclKey] || 0);

		option.addEventListener('change', function() {
			if (option.checked) {
				const upd = {
					[exclKey]: +option.value
				};
				store.set(upd)
					.catch(() => excludeRadio.checked = !upd[exclKey]);
			}
		});
	});
});
