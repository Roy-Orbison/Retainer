/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/
 *
 * © 2021 Roy Orbison
 * */

const excludeCheckbox = document.querySelector('#exclude-default'),
	exclKey = 'excludeDefault',
	store = browser.storage.sync;
excludeCheckbox.indeterminate = true;

store.get(exclKey).then(res => {
	excludeCheckbox.disabled = false;
	excludeCheckbox.indeterminate = false;
	excludeCheckbox.checked = !!(res && res[exclKey]);

	excludeCheckbox.addEventListener('change', function() {
		excludeCheckbox.indeterminate = true;
		const upd = {
			[exclKey]: excludeCheckbox.checked
		};
		store.set(upd)
			.finally(() => excludeCheckbox.indeterminate = false)
			.catch(() => excludeCheckbox.checked = !upd[exclKey]);
	});
});
