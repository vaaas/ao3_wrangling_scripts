 function detatch_characters_from_syns(items) {
	const has_attached_characters = dom => dom.querySelectorAll("#parent_Character_associations_to_remove_checkboxes li").length === 0 ? false : true

	const all_characters_button = dom => dom.querySelector("dd.tags.listbox.group[title='Characters'] ul.actions li a.check_all")

	const get_form = dom => dom.querySelector("form#edit_tag")

	const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

	const open_window = url => new Promise(res => {
		const win = window.open(url)
		win.onload = _ => res(win) })

	async function main(urls) {
		for (let i = 0; i < urls.length; i++) {
			url = urls[i]
			const win = await open_window(url)
			const doc = win.document
			if (has_attached_characters(doc)) {
				all_characters_button(doc).click()
				get_form(doc).submit()
				console.log(url) }
			win.close()
			await sleep(3000) }}
	
	main(items) }
