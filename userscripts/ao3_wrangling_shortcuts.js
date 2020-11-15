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
// @version	0.7.1
// @updateURL	https://raw.githubusercontent.com/vaaas/ao3_wrangling_scripts/master/userscripts/ao3_wrangling_shortcuts.js
// ==/UserScript==

function wrangling_keystrokes(window)
	{ 'use strict'

	// if you wish to change the default key bindings, this is where you do it
	// the format is 'C-A-S-letter'
	// C means control
	// A means alt
	// S means shift
	// don't capitalise the letter!
	const bindings =
		{ down: 'A-j',
		up: 'A-k',
		previous: 'A-h',
		next: 'A-l',
		save: 'A-s',
		focus_fandom: 'A-f',
		focus_syn: 'A-e',
		toggle_unwrangleable: 'A-u',
		toggle_canonical: 'A-i',
		open_works: 'A-r',
		open_comments: 'A-p',
		open_mergers: 'A-o',
		focus_tag_name: 'A-n',
		toggle_rel_helper: 'A-v',
		focus_characters: 'A-c',
		go_to_canonical: 'A-g',
		select_characters: 'A-a',
		select_fandoms: 'A-S-a',
		edit_tag: 'A-w',
		toggle_selection: 'A-m',
		click_freeform: 'A-a',
		click_relationship: 'A-r',
		add: 'A-n',
		remove: 'A-d',
		toggle_rel_type: 'A-t', }

	let keys = new Map()

	const K_ = a => b => () => a(b)
	const B = a => b => c => a(b(c))
	const B1 = a => b => c => d => a(b(c)(d))
	const D = f => fa => fb => a => b => f(fa(a))(fb(b))
	const T = x => f => f(x)
	const $ = (q, node=document) => node.querySelector(q)
	const $$ = (q, node=document) => Array.from(node.querySelectorAll(q))
	const not = x => !x
	const qs = q => node => node.querySelector(q)
	const qss = q => node => Array.from(node.querySelectorAll(q))
	const href = x => x.href
	const endsWith = s => x => x.endsWith(s)
	const last = xs => xs[xs.length - 1]
	const initial = xs => xs.slice(0, xs.length - 1)
	const focus = x => x.focus()
	const click = x => x.click()
	const open = x => window.open(x, 1)
	const P = (x, ...xs) => xs.reduce((a,b) => b(a), x)
	const PP = (...xs) => x => xs.reduce((a,b) => b(a), x)
	const map = f => x => x.map(f)
	const split = d => x => x.split(d)
	const N = o => x => new o(x)
	const just = x => () => x
	const get = x => x.get()
	const insertBefore = (what, where) => where.parentNode.insertBefore(what, where)
	const flatten = x => x.flat()
	const join = s => x => x.join(s)
	const filter = f => x => x.filter(f)
	const sans = n => filter((x,i) => i !== n)
	const findIndex = f => xs => rejecter(-1)(xs.findIndex(f))
	const find = f => xs => rejecter(undefined)(xs.find(f))
	const rejecter = bad => x => x === bad ? null : x
	const pluck = k => x => x[k]
	const tap = f => x => { f(x) ; return x }
	const add = a => b => a + b
	const addr = a => b => b + a
	const length = x => x.length
	const is = a => b => a === b
	const isnt = B1(not)(is)
	const value = x => x.value
	const match = regex => x => x.match(regex)
	const maybe = f => x => x === null ? x : f(x)
	const nothing = f => x => x !== null ? x : f(x)
	const add_class = c => tap(x => x.classList.add(c))
	const remove_class = c => tap(x => x.classList.remove(c))
	const scroll_into_view = tap(x => x.scrollIntoView(false))
	const WHEN = cond => then => x => cond(x) ? then(x) : x
	const target = x => x.target

	const swap = (a, b) => x =>
		{ const av = x[a]
		const bv = x[b]
		return x.map((x, i) =>
			{ if (i === a) return bv
			else if (i === b) return av
			else return x }) }

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
		remove()
			{ this.clear()
			if (this.parent)
				this.parent._children.delete(this)
			this.element.remove()
			this.watches.forEach((f, o) => o.unwatch(f))
			return this }
		on(o, f)
			{ const g = f(this)
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
			return this }
		bind(o)
			{ this.element.value = o.get()
			this.element.onchange = () => o.map(just(this.element.value))
			this.on(o, me => WHEN(isnt(me.element.value))(x => me.element.value=x))
			return this }}

	class Options extends E
		{ constructor(options)
			{ super('select')
			this.children(
				Object.entries(options).map(([text, value]) =>
					new E('option').text(text).value(value))) }}

	class TextBox extends E
		{ constructor()
			{ super('input')
			.style('max-width: 50em; margin: 1em; display: block;') }}

	function main() { wrangling_check(window.location.pathname) }

	function key_pressed(keyevent)
		{ const cb = valid_shortcut_p(keyevent)
		if (cb === false) return true
		else
			{ cb()
			keyevent.preventDefault()
			keyevent.stopPropagation()
			return false }}

	function is_in_view(el)
		{ const rect = el.getBoundingClientRect()
		return (rect.top >= 0) && (rect.bottom <= window.innerHeight) }

	function define_key(keystring, cb)
		{ const keyparts = keystring.split('-')
		const modset = new Set(initial(keyparts))
		let charcode = last(keyparts).charCodeAt(0)-32
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
		let charcode = event.keyCode
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
		const all_fandoms = $('dd[title="Fandoms"] a.check_all')
		const mergers = location.origin + location.pathname.match(/(\/tags\/[^\/]+)/)[1] + '/wrangle?page=1&show=mergers'

		define_key(bindings.save, K_(click)(save))
		define_key(bindings.focus_syn, focus_syn_bar)
		define_key(bindings.focus_fandom, K_(focus)(fandom))
		define_key(bindings.toggle_unwrangleable, K_(click)(unwrangleable))
		define_key(bindings.open_works, K_(open)(works.href))
		define_key(bindings.open_comments, K_(open)(comments.href))
		define_key(bindings.toggle_canonical, K_(click)(canonical))
		define_key(bindings.open_mergers, K_(open)(mergers))
		define_key(bindings.focus_tag_name, K_(focus)(tagname))
		define_key(bindings.select_fandoms, K_(click)(all_fandoms))

		if (relationship_check())
			{ const characters = $('#tag_character_string_autocomplete')
			define_key(bindings.toggle_rel_helper, rel_helper)
			define_key(bindings.focus_characters, K_(focus)(characters)) }

		if (synonym_check())
			{ const edit_synonym = $('p.actions:nth-of-type(2) > a')
			define_key(bindings.go_to_canonical, K_(click)(edit_synonym)) }

		if (characters_check())
			{ const allchars = $('dd[title="Characters"] a.check_all')
			define_key(bindings.select_characters, K_(click)(allchars)) }

		function focus_syn_bar()
			{ P(document,
				qs('#edit_tag fieldset:first-of-type .delete'),
				maybe(click),
				() => P(document,
					qs('input#tag_syn_string_autocomplete'),
					maybe(focus))) }

		function relationship_check()
			{ const element = $('#edit_tag > fieldset:nth-child(4) > dl:nth-child(3) > dd:nth-child(4) > strong:nth-child(1)')
			return (element && element.innerHTML === 'Relationship') }

		function synonym_check()
			{ return Boolean($('p.actions:nth-of-type(2) > a')) }

		function characters_check()
			{ return Boolean($('dd[title="Characters"] a.check_all')) } }

	function wrangle_tags_page()
		{ console.log('wrangle tags page activated')
		document.styleSheets[0].insertRule('.focused { outline: 2px solid #D50000; }', 1)
		const save = $('dd.submit > input[name="commit"]')
		const next = $('li.next > a')
		const previous = $('li.previous > a')
		const inputbar = $('#fandom_string_autocomplete')

		const rows = $$('tbody > tr')
		let selected_row = null
		const current_row = () => maybe(x => rows[x])(selected_row)

		define_key(bindings.save, K_(click)(save))
		define_key(bindings.focus_fandom, K_(focus)(inputbar))
		define_key(bindings.down, select_next_row)
		define_key(bindings.up, select_previous_row)
		define_key(bindings.edit_tag, open_edit_tag_page)
		define_key(bindings.toggle_selection, toggle_mass_wrangling_selected)
		define_key(bindings.next, K_(click)(next))
		define_key(bindings.previous, K_(click)(previous))
		define_key(bindings.open_works, open_works)
		define_key(bindings.open_mergers, open_mergers_page)
		define_key(bindings.open_comments, open_comments)

		function deselect_row()
			{ maybe(remove_class('focused'))(current_row()) }

		function select_row()
			{ P(current_row(),
				maybe(PP(add_class('focused'),
					WHEN(B(not)(is_in_view))(scroll_into_view)))) }

		function select_first_row()
			{ deselect_row()
			selected_row = 0
			select_row() }

		function select_last_row()
			{ deselect_row()
			selected_row = rows.length - 1
			select_row() }

		function select_next_row()
			{ P(selected_row,
				maybe(rejecter(rows.length - 1)),
				maybe(PP
					(tap(deselect_row),
					() => selected_row += 1,
					select_row)),
				nothing(select_first_row)) }

		function select_previous_row()
			{ P(selected_row,
				maybe(rejecter(0)),
				maybe(PP
					(tap(deselect_row),
					() => selected_row -= 1,
					select_row)),
				nothing(select_last_row)) }

		function open_edit_tag_page()
			{ P(current_row(),
				maybe(PP(
					qss('ul.actions li a'),
					find(B(endsWith('edit'))(href)))),
				maybe(PP(
					href,
					open))) }

		function open_mergers_page()
			{ P(current_row(),
				maybe(PP(
					qss('ul.actions li a'),
					find(B(endsWith('edit'))(href)))),
				maybe(PP(
					href,
					match(/(.+)\/edit/),
					pluck(1),
					addr('/wrangle?page=1&show=mergers'),
					open))) }

		function open_comments()
			{ P(current_row(),
				maybe(PP(
					qss('ul.actions li a'),
					find(B(endsWith('edit'))(href)))),
				maybe(PP(
					href,
					match(/(.+)\/edit/),
					pluck(1),
					addr('/comments'),
					open))) }

		function toggle_mass_wrangling_selected()
			{ P(current_row(),
				maybe(qs('th input[type="checkbox"]')),
				maybe(click)) }

		function open_works()
			{ P(current_row(),
				maybe(PP(
					qss('ul.actions li a'),
					find(B(endsWith('works'))(href)))),
				maybe(PP(href, open))) }}

	function tag_comments_page()
		{ console.log('tag comments page activated')
		const textarea = $('textarea')
		const submit = $('.new_comment input[type="submit"]')
		const href = location.origin + location.pathname.match(/(\/tags\/[^\/]+)/)[1] + '/edit'

		window.requestAnimationFrame(K_(focus)(textarea))

		define_key(bindings.save, K_(click)(submit))
		define_key(bindings.edit_tag, K_(open)(href)) }

	function new_tag_page()
		{ console.log('new tag page activated')
		const name = $('#tag_name')
		const canonical = $('#tag_canonical')
		const fandom = $('#tag_type_fandom')
		const character = $('#tag_type_character')
		const relationship = $('#tag_type_relationship')
		const freeform = $('#tag_type_freeform')
		const submit = $('p.submit.actions input[type="submit"]')

		define_key(bindings.focus_tag_name, K_(focus)(name))
		define_key(bindings.toggle_canonical, K_(click)(canonical))
		define_key(bindings.focus_fandom, K_(click)(fandom))
		define_key(bindings.focus_characters, K_(click)(character))
		define_key(bindings.click_relationship, K_(click)(relationship))
		define_key(bindings.click_freeform, K_(click)(freeform))
		define_key(bindings.save, K_(click)(submit)) }

	function rel_helper()
		{ console.log('rel helper activated')
		const keys_cache = keys
		keys = new Map()

		maybe(click)($('#edit_tag fieldset:first-of-type .delete'))
		const rel_field = $('input#tag_syn_string_autocomplete')

		let focused = null
		const parts = new Observable([])
		parts.length = function() { return this.get().length }
		const reltype = new Observable('/')

		const editbox = new E('div')
			.on(parts, me => PP
				(tap(()=>focused=null),
				map(x =>
					new TextBox()
					.bind(x)
					.focus(PP(target, tap(x => focused=x), add_class('focused')))
					.unfocus(PP(target, tap(() => focused=null), remove_class('focused')))),
				me.children.bind(me)))

		const fieldset = new E('fieldset')
			.child(new Options({ 'romantic': '/', 'platonic': ' & ' })
				.bind(reltype)
				.style('max-width: 10em; margin: 1em; display: block;'))
			.child(editbox)

		P($('#tag_name').value,
			split('/'),
			map(split('&')),
			flatten,
			map(trim),
			map(N(Observable)),
			just,
			map,
			T(parts))

		insertBefore(fieldset.element, $('#edit_tag fieldset:nth-of-type(2)'))
		editbox.element.firstElementChild.focus()

		define_key(bindings.save, commit_rel)
		define_key(bindings.toggle_rel_helper, cancel)
		define_key(bindings.add, append_char)
		define_key(bindings.remove, remove_char)
		define_key(bindings.down, focus_next)
		define_key(bindings.up, focus_prev)
		define_key(bindings.previous, move_before)
		define_key(bindings.next, move_after)
		define_key(bindings.toggle_rel_type, toggle_rel)

		function toggle_rel()
			{ reltype.map(x => x === '/' ? ' & ' : '/') }

		function commit_rel()
			{ P(parts,
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
			{ if (parts.length() <= 1) return
			P(focused,
				maybe(PP(D(is)(value)(get), findIndex, T(parts.get()))),
				maybe(PP(
					tap(PP(sans, map, T(parts))),
					PP(x => parts.length() >= x ? parts.length() - 1 : x,
						pluck,
						T(editbox.element.children),
						focus)))) }

		function focus_next()
			{ P(focused,
				maybe(PP(pluck('nextSibling'))),
				maybe(focus),
				nothing(()=>editbox.element.firstElementChild.focus())) }

		function focus_prev()
			{ P(focused,
				maybe(PP(pluck('previousSibling'))),
				maybe(focus),
				nothing(()=>editbox.element.lastElementChild.focus())) }

		function move_before()
			{ P(focused,
				maybe(PP(D(is)(value)(get), findIndex, T(parts.get()))),
				maybe(rejecter(0)),
				maybe(PP(
					tap(x => parts.map(swap(x, x-1))),
					PP(add(-1), pluck, T(editbox.element.children), focus)))) }

		function move_after()
			{ P(focused,
				maybe(PP(D(is)(value)(get), findIndex, T(parts.get()))),
				maybe(P(parts, get, length, add(-1), rejecter)),
				maybe(PP(
					tap(x => parts.map(swap(x, x+1))),
					PP(add(1), pluck, T(editbox.element.children), focus)))) } }

	main() }

if (document.readyState === 'complete')
	wrangling_keystrokes(window)
else
	window.addEventListener('load', () => wrangling_keystrokes(window))
