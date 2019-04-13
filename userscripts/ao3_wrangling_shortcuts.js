// ==UserScript==
// @name	ao3-wrangling-shortcuts
// @description	adds keyboard shortcuts to the ao3 wrangling interface
//
// @author	Vasileios Pasialiokis <whiterocket@outlook.com>
// @namespace https://github.com/vaaas/
// @downloadURL	https://raw.githubusercontent.com/vaaas/ao3_wrangling_shortcuts/master/ao3_wrangling_shortcuts.js
//
// @license	AGPLv3 - https://www.gnu.org/licenses/agpl.html
//
// @match	https://archiveofourown.org/*
// @match	http://insecure.archiveofourown.org/*
//
// @version	0.1.6
// @updateURL	https://raw.githubusercontent.com/vaaas/ao3_wrangling_shortcuts/master/ao3_wrangling_shortcuts.js
// ==/UserScript==

function wrangling_keystrokes(window) {
	"use strict"
	const keys = new Map()

	main()

	function main() { wrangling_check(window.location.pathname) }
	
	function key_pressed (keyevent) {
		const cb = valid_shortcut_p(keys, keyevent)
		if (cb === false) return true
		else {
			cb()
			keyevent.preventDefault()
			keyevent.stopPropagation()
			return false }}
	
	function filter_one(arr, cb) {
		for (let i = 0, len = arr.length; i < len; i++)
			if (cb(arr[i], i, arr))
				return arr[i]
		return null }

	function is_in_view (el) {
		const rect = el.getBoundingClientRect()
		const elemTop = rect.top
		const elemBottom = rect.bottom
		const isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight)
		return isVisible }

	function define_key(keys, keystring, cb) {
		const keyparts = keystring.split("-")
		const char = keyparts[keyparts.length-1]
		const modset = new Set(keyparts.slice(0, keyparts.length - 1))
		let charcode = char.charCodeAt(0)
		if (charcode > 0b1111111)
			throw new RangeError("character code is larger than 255")
		if (modset.has("C"))
			charcode += 0b10000000000
		if (modset.has("A"))
			charcode += 0b01000000000
		if (modset.has("S"))
			charcode += 0b00100000000
		keys.set(charcode, cb) }

	function keyevent_to_bitmap(event) {
		if (event.key.length > 1)
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

	function valid_shortcut_p(keys, keyevent) {
		const charcode = keyevent_to_bitmap(keyevent)
		if (charcode !== null && (charcode & 0b11100000000) > 0 && keys.has(charcode))
			return keys.get(charcode)
		else return false }

	function wrangling_check(pathname) {
		if (new RegExp("^/tags/([^/]+)/edit$").test(pathname))
			edit_tag_page()
		else if (new RegExp("^/tags/([^/]+)/wrangle$").test(pathname))
			wrangle_tags_page() }

	function edit_tag_page() {
		console.log("edit tag page activated")
		window.onkeydown = key_pressed
		const elements = new Map()
		elements.set("save", document.querySelector("p.submit.actions > input[name='commit']"))
		elements.set("syn", document.querySelector("input#tag_syn_string_autocomplete"))
		elements.set("fandom", document.querySelector("input#tag_fandom_string_autocomplete"))
		elements.set("unwrangleable", document.querySelector("#tag_unwrangleable"))
		elements.set("works", document.querySelector("ul.navigation.actions:nth-of-type(2) > li > a"))
		elements.set("comments", document.querySelector("p.navigation.actions > a"))
		elements.set("canonical", document.querySelector("#tag_canonical"))

		function commit_tag_edit() { elements.get("save").click() }
		function focus_syn_bar() { elements.get("syn").focus() }
		function focus_fandom_bar() { elements.get("fandom").focus() }
		function toggle_unwrangleable() { elements.get("unwrangleable").click() }
		function open_works() { window.open(elements.get("works").href, 1) }
		function focus_characters() { elements.get("characters").focus() }
		function go_to_synonym() { elements.get("edit_synonym").click() }
		function open_comments() { window.open(elements.get("comments").href, 1) }
		function toggle_canonical() { elements.get("canonical").click() }

		define_key(keys, "A-s", commit_tag_edit)
		define_key(keys, "A-e", focus_syn_bar)
		define_key(keys, "A-f", focus_fandom_bar)
		define_key(keys, "A-u", toggle_unwrangleable)
		define_key(keys, "A-r", open_works)
		define_key(keys, "A-m", open_comments)
		define_key(keys, "A-i", toggle_canonical)

		if (relationship_check()) {
			elements.set("characters", document.querySelector("#tag_character_string_autocomplete"))
			define_key(keys, "A-c", focus_characters) }

		if (synonym_check()) {
			elements.set("edit_synonym", document.querySelector("p.actions:nth-of-type(2) > a"))
			define_key(keys, "A-g", go_to_synonym) }

		function relationship_check() {
			const element = document.querySelector("#edit_tag > fieldset:nth-child(4) > dl:nth-child(3) > dd:nth-child(4) > strong:nth-child(1)")
			return (element && element.innerHTML === "Relationship") }

		function synonym_check() {
			const element = document.querySelector("p.actions:nth-of-type(2) > a")
			return (element ? true : false) }}

	function wrangle_tags_page() {
		console.log("wrangle tags page activated")
		window.onkeydown = key_pressed
		document.styleSheets[0].insertRule(".focused { outline: 2px solid #D50000; }", 1)
		const elements = new Map()
		elements.set("save", document.querySelector("dd.submit > input[name='commit']"))
		elements.set("next", document.querySelector("li.next > a"))
		elements.set("previous", document.querySelector("li.previous > a"))
		elements.set("inputbar", document.querySelector("#fandom_string_autocomplete"))
		elements.set("rows", document.querySelectorAll("tbody > tr"))
		let selected_row = null

		define_key(keys, "A-s", commit_mass_wrangle)
		define_key(keys, "A-e", focus_input_bar)
		define_key(keys, "A-j", select_next_row)
		define_key(keys, "A-k", select_previous_row)
		define_key(keys, "A-w", open_edit_tag_page)
		define_key(keys, "A-m", toggle_mass_wrangling_selected)
		define_key(keys, "A-l", next_page)
		define_key(keys, "A-h", previous_page)
		define_key(keys, "A-r", open_works)

		function commit_mass_wrangle() { elements.get("save").click() }
		function focus_input_bar() { elements.get("inputbar").focus() }

		function deselect_row() {
			elements.get("rows")[selected_row].classList.remove("focused") }

		function select_row() {
			const element = elements.get("rows")[selected_row]
			element.classList.add("focused")
			if (!is_in_view(element))
				element.scrollIntoView(false) }

		function select_first_row() {
			selected_row = 0
			select_row() }

		function select_last_row() {
			selected_row = elements.get("rows").length - 1
			select_row() }

		function select_next_row() {
			if (selected_row === null) select_first_row()
			else if (selected_row + 1 < elements.get("rows").length) {
				deselect_row()
				selected_row++
				select_row() }}

		function select_previous_row() {
			if (selected_row === null) select_last_row()
			else if (selected_row > 0) {
				deselect_row()
				selected_row--
				select_row() }}

		function open_edit_tag_page() {
			if (selected_row === null) return
			const href = filter_one(
				elements.get("rows")[selected_row].querySelectorAll("ul.actions > li > a"),
				x => x.innerHTML === "Edit").href
			const win = window.open(href, "_blank") }

		function toggle_mass_wrangling_selected() {
			if (selected_row === null) return
			elements.get("rows")[selected_row].querySelector("th input[type='checkbox']").click() }
		
		function open_works() {
			if (selected_row === null) return
			const href = filter_one(
				elements.get("rows")[selected_row].querySelectorAll("ul.actions > li > a"),
				x => x.innerHTML === "Works").href
			const win = window.open(href, "_blank") }
		
		function next_page() {
			const n = elements.get("next")
			if (n) n.click() }
		
		function previous_page() {
			const p = elements.get("previous")
			if (p) p.click() }}}

if (document.readyState === "complete")
	wrangling_keystrokes(window)
else
	window.addEventListener("load", () => wrangling_keystrokes(window))
