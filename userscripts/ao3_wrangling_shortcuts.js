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
// @version	0.6.1
// @updateURL	https://raw.githubusercontent.com/vaaas/ao3_wrangling_scripts/master/userscripts/ao3_wrangling_shortcuts.js
// ==/UserScript==

function wrangling_keystrokes(window)
	{ 'use strict'
	const K_ = a => b => () => a(b)
	let keys = new Map()
	const $ = (q, node=document) => node.querySelector(q)
	const $$ = (q, node=document) => Array.from(node.querySelectorAll(q))
	const href_ends_with = x => e => e.href.endsWith(x)
	const last = xs => xs[xs.length - 1]
	const initial = xs => xs.slice(0, xs.length - 1)
	const focus = x => x.focus()
	const click = x => x.click()
	const open = x => window.open(x, 1)
	const pipe = (x, ...xs) => xs.reduce((a,b) => b(a), x)
	const map = f => x => x.map(f)
	const mapping = x => f => x.map(f)
	const split = d => x => x.split(d)
	const reduce = (f, initial) => x => x.reduce(f, initial)
	const merge = (a, b) => [...a, ...b]
	const each = f => x => x.forEach(f)
	const N = o => x => new o(x)
	const just = x => () => x
	const IF = (clause, then) => x => clause(x) ? then(x) : undefined
	const get = x => x.get()
	const insertBefore = (what, where) => where.parentNode.insertBefore(what, where)
	const flatten = x => x.flat()
	const log = x => console.log(x)
	const join = s => x => x.join(s)
	const filter = f => x => x.filter(f)

	const swap = (a, b) => x =>
		{ const av = x[a]
		const bv = x[b]
		return x.map((x, i) =>
			{ if (i === a) return bv
			else if (i === b) return av
			else return x }) }

	const pop = n => filter((x,i) => i !== n)

	class Observable
		{ constructor(x)
			{ this.x = x
			this.watchers = new Set() }
		map(f)
			{ this.x = f(this.x)
			this.notify()
			return this }
		get() { return this.x }
		notify()
			{ this.watchers.forEach(f => f(this.x))
			return this }
		watch(f)
			{ this.watchers.add(f)
			return this }
		unwatch(f)
			{ this.watchers.delete(f)
			return this }}

	class E
		{ constructor(x)
			{ this.element = document.createElement(x)
			this.watches = new Map()
			this._children = new Set() }
		child(x)
			{ x.parent = this
			this._children.add(x)
			this.element.appendChild(x.element)
			return this }
		children(xs)
			{ this.clear()
			xs.forEach(x => this.child(x))
			return this }
		clear()
			{ this._children.forEach(x => x.remove())
			return this }
		remove(x)
			{ this.clear()
			if (this.parent)
				this.parent._children.delete(this)
			this.element.remove()
			this.watches.forEach((f, o) => o.unwatch(f))
			return this }
		on(o, f)
			{ const g = x => f(x, this)
			o.watch(g)
			if (this.watches.has(o))
				this.watches.get(o).push(g)
			else
				this.watches.set(o, [g])
			return this }
		value(x)
			{ this.element.value = x
			return this }
		focus(f)
			{ this.element.onfocus = f
			return this }
		unfocus(f)
			{ this.element.addEventListener('focusout', f)
			return this }
		style(x)
			{ this.element.style = x
			return this }
		input(f)
			{ this.element.oninput = f
			return this }
		text(x)
			{ this.element.innerText = x
			return this }
		find(f)
			{ for (const x of this._children.values())
				if (f(x)) return x
			return null }
		each(f)
			{ for (const x of this._children.values())
				f(x)
			return this }}

	class Options extends E {
		constructor(options)
			{ super('select')
			this.children(
				Object.entries(options).map(([text, value]) =>
					new E('option').text(text).value(value))) }
		bind(o)
			{ this.onchange = () => o.map(this.element.value)
			o.watch(x =>
				{ if (this.element.value === x) return
				this.element.value = x })
			return this }}

	Array.prototype.filter_one = function(cb)
		{ for (let i = 0, len = this.length; i < len; i++)
			if (cb(this[i], i, this))
				return this[i]
		throw new Error('not found') }

	function main() { wrangling_check(window.location.pathname) }

	function key_pressed (keyevent)
		{ const cb = valid_shortcut_p(keyevent)
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
		{ const keyparts = keystring.split('-')
		const modset = new Set(initial(keyparts))
		let charcode = last(keyparts).charCodeAt(0)
		if (charcode > 0b1111111)
			throw new RangeError('character code is larger than 255')
		if (modset.has('C'))
			charcode += 0b10000000000
		if (modset.has('A'))
			charcode += 0b01000000000
		if (modset.has('S'))
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

	function valid_shortcut_p(keyevent)
		{ const charcode = keyevent_to_bitmap(keyevent)
		if (charcode !== null && (charcode & 0b11100000000) > 0 && keys.has(charcode))
			return keys.get(charcode)
		else return false }

	function wrangling_check(x)
		{ let y = x.match(new RegExp('^/tags/[^/]+/(.+)$'))
		switch(true)
		{ case x === '/tags/new':
			new_tag_page()
			window.onkeydown = key_pressed
			break
		case x === '/tag_wranglings':
			wrangle_tags_page()
			window.onkeydown = key_pressed
			break
		case y === null: break
		case y[1] === 'edit':
			edit_tag_page()
			window.onkeydown = key_pressed
			break
		case y[1] === 'wrangle':
			wrangle_tags_page()
			window.onkeydown = key_pressed
			break
		case y[1] === 'comments':
			tag_comments_page()
			window.onkeydown = key_pressed
			break
		default: break }}

	function edit_tag_page()
		{ console.log('edit tag page activated')
		document.styleSheets[0].insertRule('.focused { outline: 2px solid #D50000; }', 1)
		const save = $('p.submit.actions > input[name="commit"]')
		const fandom = $('input#tag_fandom_string_autocomplete')
		const unwrangleable = $('#tag_unwrangleable')
		const works = $('ul.navigation.actions:nth-of-type(2) > li > a')
		const comments = $('p.navigation.actions > a')
		const canonical = $('#tag_canonical')
		const tagname = $('#tag_name')
		const mergers = location.origin + location.pathname.match(/(\/tags\/[^\/]+)/)[1] + '/wrangle?page=1&show=mergers'

		define_key('A-s', K_(click)(save))
		define_key('A-e', focus_syn_bar)
		define_key('A-f', K_(focus)(fandom))
		define_key('A-u', K_(click)(unwrangleable))
		define_key('A-r', K_(open)(works.href))
		define_key('A-m', K_(open)(comments.href))
		define_key('A-i', K_(click)(canonical))
		define_key('A-o', K_(open)(mergers))
		define_key('A-n', K_(focus)(tagname))

		if (relationship_check())
			{ const characters = $('#tag_character_string_autocomplete')
			define_key('C-h', rel_helper)
			define_key('A-c', K_(focus)(characters)) }

		if (synonym_check())
			{ const edit_synonym = $('p.actions:nth-of-type(2) > a')
			define_key('A-g', K_(click)(edit_synonym)) }

		if (characters_check())
			{ const allchars = $('dd[title="Characters"] a.check_all')
			define_key('A-a', K_(click)(allchars)) }

		function focus_syn_bar()
			{ const x = $('#edit_tag fieldset:first-of-type .delete')
			if (x) x.click()
			$('input#tag_syn_string_autocomplete').focus() }

		function relationship_check()
			{ const element = $('#edit_tag > fieldset:nth-child(4) > dl:nth-child(3) > dd:nth-child(4) > strong:nth-child(1)')
			return (element && element.innerHTML === 'Relationship') }

		function synonym_check()
			{ const element = $('p.actions:nth-of-type(2) > a')
			return Boolean(element) }

		function characters_check()
			{ const element = $('dd[title="Characters"] a.check_all')
			return Boolean(element) }}

	function wrangle_tags_page()
		{ console.log('wrangle tags page activated')
		document.styleSheets[0].insertRule('.focused { outline: 2px solid #D50000; }', 1)
		const save = $('dd.submit > input[name="commit"]')
		const next = $('li.next > a')
		const previous = $('li.previous > a')
		const inputbar = $('#fandom_string_autocomplete')

		const rows = $$('tbody > tr')
		let selected_row = null
		const current_row = () => rows[selected_row]

		define_key('A-s', K_(click)(save))
		define_key('A-e', K_(focus)(inputbar))
		define_key('A-j', select_next_row)
		define_key('A-k', select_previous_row)
		define_key('A-w', open_edit_tag_page)
		define_key('A-m', toggle_mass_wrangling_selected)
		define_key('A-l', K_(click)(next))
		define_key('A-h', K_(click)(previous))
		define_key('A-r', open_works)
		define_key('A-o', open_mergers_page)
		define_key('A-c', open_comments)

		function deselect_row()
			{ current_row().classList.remove('focused') }

		function select_row()
			{ const element = current_row()
			element.classList.add('focused')
			if (!is_in_view(element))
				element.scrollIntoView(false) }

		function select_first_row()
			{ selected_row = 0
			select_row() }

		function select_last_row()
			{ selected_row = rows.length - 1
			select_row() }

		function select_next_row()
			{ if (selected_row === null) select_first_row()
			else if (selected_row + 1 < rows.length) {
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
			pipe(
				$$('ul.actions li a', current_row())
				.filter_one(href_ends_with('edit'))
				.href,
				open) }

		function open_mergers_page()
			{ if (selected_row === null) return
			pipe(
				$$('ul.actions li a', current_row())
				.filter_one(href_ends_with('edit'))
				.href
				.match(/(.+)\/edit/)[1] +
				'/wrangle?page=1&show=mergers',
				open) }

		function open_comments()
			{ if (selected_row === null) return
			pipe($$('ul.actions li a', current_row())
				.filter_one(href_ends_with('edit'))
				.href
				.match(/(.+)\/edit/)[1] +
				'/comments',
				open) }

		function toggle_mass_wrangling_selected()
			{ if (selected_row === null) return
			$('th input[type="checkbox"]', current_row()).click() }

		function open_works()
			{ if (selected_row === null) return
			pipe(
				$$('ul.actions li a', current_row())
				.filter_one(href_ends_with('works'))
				.href,
				open) }}

	function tag_comments_page()
		{ console.log('tag comments page activated')
		const textarea = $('textarea')
		const submit = $('.new_comment input[type="submit"]')
		const href = location.origin + location.pathname.match(/(\/tags\/[^\/]+)/)[1] + '/edit'

		window.requestAnimationFrame(K_(focus)(textarea))

		define_key('A-s', K_(click)(submit))
		define_key('A-w', K_(open)(href)) }

	function new_tag_page()
		{ console.log('new tag page activated')
		const name = $('#tag_name')
		const canonical = $('#tag_canonical')
		const fandom = $('#tag_type_fandom')
		const character = $('#tag_type_character')
		const relationship = $('#tag_type_relationship')
		const freeform = $('#tag_type_freeform')
		const submit = $('p.submit.actions input[type="submit"]')

		define_key('A-e', K_(focus)(name))
		define_key('A-i', K_(click)(canonical))
		define_key('A-f', K_(click)(fandom))
		define_key('A-c', K_(click)(character))
		define_key('A-r', K_(click)(relationship))
		define_key('A-a', K_(click)(freeform))
		define_key('A-s', K_(click)(submit)) }

	function rel_helper()
		{ const keys_cache = keys
		keys = new Map()

		IF(Boolean, click)($('#edit_tag fieldset:first-of-type .delete'))
		const rel_field = $('input#tag_syn_string_autocomplete')

		let focused = null
		const new_input = x => new E('input')
			.style('max-width: 50em; margin: auto; margin-bottom: 1em; margin-top: 1em; display: block;')
			.value(x.get())
			.focus(e =>
				{ focused = e.target
				e.target.classList.add('focused') })
			.unfocus(e =>
				{ if (focused === e.target) focused = null
				e.target.classList.remove('focused') })
			.input(e => x.map(just(e.target.value)))
		const parts = new Observable([])
		const reltype = new Observable('/')

		const editbox = new E('div')
			.on(parts, (x, me) => {
				pipe(x,
					map(new_input),
					x => me.children(x))
				focused = null })

		const fieldset = new E('fieldset')
			.child(new Options({ 'romantic': '/', 'platonic': ' & ' })
				.bind(reltype)
				.style('max-width: 10em; margin: 1em; display: block;'))
			.child(editbox)

		pipe($('#tag_name').value,
			split('/'),
			map(split('&')),
			flatten,
			map(N(Observable)),
			just,
			mapping(parts))
	
		insertBefore(fieldset.element, $('#edit_tag fieldset:nth-of-type(2)'))
		editbox.element.firstElementChild.focus()

		define_key('C-s', commit_rel)
		define_key('C-q', cancel)
		define_key('C-n', append_char)
		define_key('C-d', remove_char)
		define_key('C-j', focus_next)
		define_key('C-k', focus_prev)
		define_key('C-h', move_before)
		define_key('C-l', move_after)
		define_key('C-t', toggle_rel)

		function toggle_rel()
			{ reltype.map(x => x === '/' ? ' & ' : '/') }

		function commit_rel()
			{ pipe(parts,
			get,
			map(get),
			join(reltype.get()),
			x => rel_field.value = x)
			cancel() }

		function cancel()
			{ fieldset.remove()
			keys = keys_cache }

		function append_char()
			{ parts.map(x => [...x, new Observable('')])
			editbox.element.lastElementChild.focus() }

		function remove_char()
			{ if (!focused || parts.get().length <= 1) return
			const i = parts.get().findIndex(x => x.get() === focused.value)
			if (i === -1) return
			parts.map(pop(i))
			editbox.element.children[parts.get().length === i ? i-1 : i].focus() }

		function focus_next()
			{ if (focused)
				IF(Boolean, focus)(focused.nextSibling)
			else editbox.element.firstElementChild.focus() }

		function focus_prev()
			{ if (focused)
				IF(Boolean, focus)(focused.previousSibling)
			else editbox.element.lastElementChild.focus() }

		function move_before()
			{ if (!focused) return
			const i = parts.get().findIndex(x => x.get() === focused.value)
			if (i === -1 || i === 0) return
			parts.map(swap(i, i-1))
			editbox.element.children[i-1].focus() }

		function move_after()
			{ if (!focused) return
			const i = parts.get().findIndex(x => x.get() === focused.value)
			if (i === -1 || i+1 === parts.get().length) return
			parts.map(swap(i, i+1))
			editbox.element.children[i+1].focus() } }

	main() }

if (document.readyState === 'complete')
	wrangling_keystrokes(window)
else
	window.addEventListener('load', () => wrangling_keystrokes(window))
