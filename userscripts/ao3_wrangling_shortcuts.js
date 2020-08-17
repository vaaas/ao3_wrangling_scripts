// ==UserScript==
// @name	ao3-wrangling-shortcuts
// @description	adds keyboard shortcuts to the ao3 wrangling interface
//
// @author	Vasileios Pasialiokis <whiterocket@outlook.com>
// @namespace https://github.com/vaaas/
// @downloadURL	https://raw.githubusercontent.com/vaaas/ao3_wrangling_scripts/master/userscripts/ao3_wrangling_shortcuts.js
//
// @license	AGPLv3 - https://www.gnu.org/licenses/agpl.html
//
// @match	https://archiveofourown.org/*
// @match	http://insecure.archiveofourown.org/*
//
// @version	0.4.2
// @updateURL	https://raw.githubusercontent.com/vaaas/ao3_wrangling_scripts/master/userscripts/ao3_wrangling_shortcuts.js
// ==/UserScript==

function wrangling_keystrokes(window)
	{ "use strict"
	const elements = new Map()
	const get = x => elements.get(x)
	const set = (k,v) => elements.set(k, v)
	const keys = new Map()
	const $ = (q, node=document) => node.querySelector(q)
	const $$ = (q, node=document) => Array.from(node.querySelectorAll(q))
	const href_ends_with = x => e => e.href.endsWith(x)
	const last = xs => xs[xs.length - 1]
	const initial = xs => xs.slice(0, xs.length - 1)

	Array.prototype.filter_one = function(cb)
		{ for (let i = 0, len = this.length; i < len; i++)
			if (cb(this[i], i, this))
				return this[i]
		throw new Error("not found") }

	function main() { wrangling_check(window.location.pathname) }

	function key_pressed (keyevent)
		{ const cb = valid_shortcut_p(keys, keyevent)
		if (cb === false) return true
		else
			{ cb()
			keyevent.preventDefault()
			keyevent.stopPropagation()
			return false }}

	function is_in_view (el)
		{ const rect = el.getBoundingClientRect()
		return (rect.top >= 0) && (rect.bottom <= window.innerHeight) }

	function define_key(keystring, cb)
		{ const keyparts = keystring.split("-")
		const modset = new Set(initial(keyparts))
		let charcode = last(keyparts).charCodeAt(0)
		if (charcode > 0b1111111)
			throw new RangeError("character code is larger than 255")
		if (modset.has("C"))
			charcode += 0b10000000000
		if (modset.has("A"))
			charcode += 0b01000000000
		if (modset.has("S"))
			charcode += 0b00100000000
		keys.set(charcode, cb) }

	function keyevent_to_bitmap(event)
		{ if (event.key.length > 1)
			return null
		let charcode = event.key.charCodeAt(0)
		if (charcode > 0b11111111)
			return null
		if (event.ctrlKey)
			charcode += 0b10000000000
		if (event.altKey)
			charcode += 0b01000000000
		if (event.shiftKey)
			charcode += 0b00100000000
		return charcode }

	function valid_shortcut_p(keys, keyevent)
		{ const charcode = keyevent_to_bitmap(keyevent)
		if (charcode !== null && (charcode & 0b11100000000) > 0 && keys.has(charcode))
			return keys.get(charcode)
		else return false }

	function wrangling_check(x)
		{ x = x.match(new RegExp("^/tags/[^/]+/(.+)$"))
		switch(true)
		{ case x === null: break
		case x[1] === 'edit':
			edit_tag_page()
			window.onkeydown = key_pressed
			break
		case x[1] === 'wrangle':
			wrangle_tags_page()
			window.onkeydown = key_pressed
			break
		case x[1] === 'comments':
			tag_comments_page()
			window.onkeydown = key_pressed
			break
		default: break }}

	function edit_tag_page()
		{ console.log("edit tag page activated")
		set("save", $("p.submit.actions > input[name='commit']"))
		set("fandom", $("input#tag_fandom_string_autocomplete"))
		set("unwrangleable", $("#tag_unwrangleable"))
		set("works", $("ul.navigation.actions:nth-of-type(2) > li > a"))
		set("comments", $("p.navigation.actions > a"))
		set("canonical", $("#tag_canonical"))
		set('tagname', $('#tag_name'))
		
		define_key("A-s", commit_tag_edit)
		define_key("A-e", focus_syn_bar)
		define_key("A-f", focus_fandom_bar)
		define_key("A-u", toggle_unwrangleable)
		define_key("A-r", open_works)
		define_key("A-m", open_comments)
		define_key("A-i", toggle_canonical)
		define_key("A-o", see_mergers)
		define_key("A-n", tagname)

		function see_mergers() { window.open(location.origin + location.pathname.match(/(\/tags\/[^\/]+)/)[1] + "/wrangle?page=1&show=mergers", 1) }
		function commit_tag_edit() { get("save").click() }
		function focus_fandom_bar() { get("fandom").focus() }
		function toggle_unwrangleable() { get("unwrangleable").click() }
		function open_works() { window.open(get("works").href, 1) }
		function focus_characters() { get("characters").focus() }
		function go_to_synonym() { get("edit_synonym").click() }
		function open_comments() { window.open(get("comments").href, 1) }
		function toggle_canonical() { get("canonical").click() }
		function allchars() { get("allchars").click() }
		function tagname() { get('tagname').focus() }

		if (relationship_check())
			{ set("characters", $("#tag_character_string_autocomplete"))
			define_key("A-c", focus_characters) }

		if (synonym_check())
			{ set("edit_synonym", $("p.actions:nth-of-type(2) > a"))
			define_key("A-g", go_to_synonym) }

		if (characters_check())
			{ set("allchars", $("dd[title='Characters'] a.check_all"))
			define_key("A-a", allchars) }

		function focus_syn_bar()
			{ const x = $("#edit_tag fieldset:first-of-type .delete")
			if (x) x.click()
			$("input#tag_syn_string_autocomplete").focus() }

		function relationship_check()
			{ const element = $("#edit_tag > fieldset:nth-child(4) > dl:nth-child(3) > dd:nth-child(4) > strong:nth-child(1)")
			return (element && element.innerHTML === "Relationship") }

		function synonym_check()
			{ const element = $("p.actions:nth-of-type(2) > a")
			return Boolean(element) }

		function characters_check()
			{ const element = $("dd[title='Characters'] a.check_all")
			return Boolean(element) }}

	function wrangle_tags_page()
		{ console.log("wrangle tags page activated")
		document.styleSheets[0].insertRule(".focused { outline: 2px solid #D50000; }", 1)
		set("save", $("dd.submit > input[name='commit']"))
		set("next", $("li.next > a"))
		set("previous", $("li.previous > a"))
		set("inputbar", $("#fandom_string_autocomplete"))
		set("rows", $$("tbody > tr"))
		let selected_row = null

		define_key("A-s", commit_mass_wrangle)
		define_key("A-e", focus_input_bar)
		define_key("A-j", select_next_row)
		define_key("A-k", select_previous_row)
		define_key("A-w", open_edit_tag_page)
		define_key("A-m", toggle_mass_wrangling_selected)
		define_key("A-l", next_page)
		define_key("A-h", previous_page)
		define_key("A-r", open_works)
		define_key("A-o", open_mergers_page)
		define_key("A-c", open_comments)

		const current_row = () => get("rows")[selected_row]

		function commit_mass_wrangle() { get("save").click() }
		function focus_input_bar() { get("inputbar").focus() }

		function deselect_row()
			{ current_row().classList.remove("focused") }

		function select_row()
			{ const element = current_row()
			element.classList.add("focused")
			if (!is_in_view(element))
				element.scrollIntoView(false) }

		function select_first_row()
			{ selected_row = 0
			select_row() }

		function select_last_row()
			{ selected_row = get("rows").length - 1
			select_row() }

		function select_next_row()
			{ if (selected_row === null) select_first_row()
			else if (selected_row + 1 < get("rows").length) {
				deselect_row()
				selected_row++
				select_row() }}

		function select_previous_row()
			{ if (selected_row === null) select_last_row()
			else if (selected_row > 0)
				{ deselect_row()
				selected_row--
				select_row() }}

		function open_edit_tag_page()
			{ if (selected_row === null) return
			const href = $$("ul.actions li a", current_row())
				.filter_one(href_ends_with("edit"))
				.href
			window.open(href, "_blank") }

		function open_mergers_page()
			{ if (selected_row === null) return
			const href = $$("ul.actions li a", current_row())
				.filter_one(href_ends_with("edit"))
				.href
				.match(/(.+)\/edit/)[1] +
				"/wrangle?page=1&show=mergers"
			window.open(href, "_blank") }
		
		function open_comments()
			{ if (selected_row === null) return
			console.log('swag')
			const href = $$("ul.actions li a", current_row())
				.filter_one(href_ends_with("edit"))
				.href
				.match(/(.+)\/edit/)[1] +
				"/comments"
			window.open(href, "_blank") }

		function toggle_mass_wrangling_selected()
			{ if (selected_row === null) return
			$("th input[type='checkbox']", current_row()).click() }

		function open_works()
			{ if (selected_row === null) return
			const href = $$("ul.actions li a", current_row())
				.filter_one(href_ends_with("works"))
				.href
			window.open(href, "_blank") }

		function next_page()
			{ const n = get("next")
			if (n) n.click() }

		function previous_page()
			{ const p = get("previous")
			if (p) p.click() }}
	
	function tag_comments_page()
		{ console.log('tag comments page activated')
		set('textarea', $('textarea'))
		set('submit', $('.new_comment input[type="submit"]'))
		
		window.requestAnimationFrame(() => get('textarea').focus())
		
		define_key('A-s', post_comment)
		
		function post_comment() { get('submit').click() }}

	main() }

if (document.readyState === "complete")
	wrangling_keystrokes(window)
else
	window.addEventListener("load", () => wrangling_keystrokes(window))
