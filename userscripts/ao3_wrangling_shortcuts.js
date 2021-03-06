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
// @version	0.7.5
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
		toggle_rel_type: 'A-t',
		flip: 'A-f', }

	function main() { wrangling_check(window.location.pathname) }

	let keys = new Map()

	const K1 = a => b => () => a(b)
	const B = a => b => c => a(b(c))
	const B1 = a => b => c => d => a(b(c)(d))
	const T = x => f => f(x)
	const P = (x, ...xs) => xs.reduce((a,b) => b(a), x)
	const PP = (...xs) => x => xs.reduce((a,b) => b(a), x)
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
	const map = f => x => x.map(f)
	const split = d => x => x.split(d)
	const insertBefore = (what, where) => where.parentNode.insertBefore(what, where)
	const flatten = x => x.flat()
	const join = s => x => x.join(s)
	const find = f => xs => rejecter(undefined)(xs.find(f))
	const rejecter = bad => x => x === bad ? null : x
	const pluck = k => x => x[k]
	const tap = f => x => { f(x) ; return x }
	const addr = a => b => b + a
	const is = a => b => a === b
	const isnt = B1(not)(is)
	const match = regex => x => x.match(regex)
	const add_class = c => tap(x => x.classList.add(c))
	const remove_class = c => tap(x => x.classList.remove(c))
	const scroll_into_view = tap(x => x.scrollIntoView(false))
	const target = x => x.target
	const trim = x => x.trim()
	const when = cond => then => x => cond(x) ? then(x) : x
	const maybe = when(isnt(null))
	const nothing = when(is(null))
	const first = pluck(0)
	const elem = x => document.createElement(x)
	const listen = e => f => tap(x => x.addEventListener(e, f))
	const child = c => tap(x => x.appendChild(c))
	const set = k => v => tap(x => x[k] = v)
	const update = o => tap(x => Object.keys(o).forEach(k => x[k] = o[k]))
	const each = f => tap(xs => xs.forEach(f))
	const children = xs => tap(x => P(xs, map(child), each(T(x))))
	const before = a => tap(b => a.before(b))
	const after = a => tap(b => a.after(b))
	const value = x => x.value

	const options = PP(Object.entries,
		map(PP(
			x => ({ innerText: first(x), value: last(x) }),
			update,
			x => x(elem('option')))),
		children,
		T(elem('select')))

	const swap = (a, b) => x =>
		{ const av = x[a]
		const bv = x[b]
		return x.map((x, i) =>
			{ if (i === a) return bv
			else if (i === b) return av
			else return x }) }

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

		define_key(bindings.save, K1(click)(save))
		define_key(bindings.focus_syn, focus_syn_bar)
		define_key(bindings.focus_fandom, K1(focus)(fandom))
		define_key(bindings.toggle_unwrangleable, K1(click)(unwrangleable))
		define_key(bindings.open_works, K1(open)(works.href))
		define_key(bindings.open_comments, K1(open)(comments.href))
		define_key(bindings.toggle_canonical, K1(click)(canonical))
		define_key(bindings.open_mergers, K1(open)(mergers))
		define_key(bindings.focus_tag_name, K1(focus)(tagname))
		define_key(bindings.select_fandoms, K1(click)(all_fandoms))

		if (relationship_check())
			{ const characters = $('#tag_character_string_autocomplete')
			define_key(bindings.toggle_rel_helper, rel_helper)
			define_key(bindings.focus_characters, K1(focus)(characters)) }

		if (synonym_check())
			{ const edit_synonym = $('p.actions:nth-of-type(2) > a')
			define_key(bindings.go_to_canonical, K1(click)(edit_synonym)) }

		if (characters_check())
			{ const allchars = $('dd[title="Characters"] a.check_all')
			define_key(bindings.select_characters, K1(click)(allchars)) }

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

		define_key(bindings.save, K1(click)(save))
		define_key(bindings.focus_fandom, K1(focus)(inputbar))
		define_key(bindings.down, select_next_row)
		define_key(bindings.up, select_previous_row)
		define_key(bindings.edit_tag, open_edit_tag_page)
		define_key(bindings.toggle_selection, toggle_mass_wrangling_selected)
		define_key(bindings.next, K1(click)(next))
		define_key(bindings.previous, K1(click)(previous))
		define_key(bindings.open_works, open_works)
		define_key(bindings.open_mergers, open_mergers_page)
		define_key(bindings.open_comments, open_comments)

		function deselect_row()
			{ maybe(remove_class('focused'))(current_row()) }

		function select_row()
			{ P(current_row(),
				maybe(PP(add_class('focused'),
					when(B(not)(is_in_view))(scroll_into_view)))) }

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

		window.requestAnimationFrame(K1(focus)(textarea))

		define_key(bindings.save, K1(click)(submit))
		define_key(bindings.edit_tag, K1(open)(href)) }

	function new_tag_page()
		{ console.log('new tag page activated')
		const name = $('#tag_name')
		const canonical = $('#tag_canonical')
		const fandom = $('#tag_type_fandom')
		const character = $('#tag_type_character')
		const relationship = $('#tag_type_relationship')
		const freeform = $('#tag_type_freeform')
		const submit = $('p.submit.actions input[type="submit"]')

		define_key(bindings.focus_tag_name, K1(focus)(name))
		define_key(bindings.toggle_canonical, K1(click)(canonical))
		define_key(bindings.focus_fandom, K1(click)(fandom))
		define_key(bindings.focus_characters, K1(click)(character))
		define_key(bindings.click_relationship, K1(click)(relationship))
		define_key(bindings.click_freeform, K1(click)(freeform))
		define_key(bindings.save, K1(click)(submit)) }

	function rel_helper()
		{ console.log('rel helper activated')
		maybe(click)($('#edit_tag fieldset:first-of-type .delete'))
		const keys_cache = keys
		keys = new Map()
		const rel_field = $('input#tag_syn_string_autocomplete')

		let focused = null

		const reltype = P(
			options({ 'romantic': '/', 'platonic': ' & ' }),
			set('style')('max-width: 10em; margin: 1em; display: block;'))

		const editbox = P($('#tag_name'),
			value,
			split('/'),
			tap(x => reltype.value = x.length > 1 ? '/' : ' & '),
			map(split('&')),
			flatten,
			map(PP(trim, input_field)),
			children,
			T(elem('div')))

		const fieldset = P(elem('fieldset'),
			child(reltype),
			child(editbox))

		insertBefore(fieldset, $('#edit_tag fieldset:nth-of-type(2)'))
		editbox.firstElementChild.focus()

		define_key(bindings.save, commit_rel)
		define_key(bindings.toggle_rel_helper, cancel)
		define_key(bindings.add, append_char)
		define_key(bindings.remove, remove_char)
		define_key(bindings.down, focus_next)
		define_key(bindings.up, focus_prev)
		define_key(bindings.previous, move_before)
		define_key(bindings.next, move_after)
		define_key(bindings.toggle_rel_type, toggle_rel)
		define_key(bindings.flip, flip_name)

		function input_field(x)
			{ return P(elem('input'),
				set('value')(x),
				set('style')('max-width: 50em; margin: 1em; display: block;'),
				listen('focus')(PP(target, add_class('focused'), tap(x=>focused=x))),
				listen('focusout')(PP(target, remove_class('focused'), tap(()=>focused=null)))) }

		function flip_name()
			{ P(focused,
			maybe(x => x.value = P(x.value,
				split(' '),
				when(x=>x.length>1)(swap(0,1)),
				join(' ')))) }

		function toggle_rel()
			{ reltype.value = reltype.value === '/' ? ' & ' : '/' }

		function commit_rel()
			{ rel_field.focus()
			P(editbox,
			pluck('children'),
			Array.from,
			map(value),
			join(reltype.value),
			set('value'),
			T(rel_field),
			cancel) }

		function cancel()
			{ fieldset.remove()
			keys = keys_cache }

		function append_char()
			{ editbox.appendChild(input_field(''))
			editbox.lastElementChild.focus() }

		function remove_char()
			{ if (focused) {
				const p = x.previousSibling
				focused.remove()
				if (p) p.focus()
				else P(editbox.children, Array.from, last, focus) }}

		function focus_next()
			{ P(focused,
			maybe(pluck('nextSibling')),
			maybe(focus),
			nothing(()=>editbox.firstElementChild.focus())) }

		function focus_prev()
			{ P(focused,
			maybe(pluck('previousSibling')),
			maybe(focus),
			nothing(()=>editbox.lastElementChild.focus())) }

		function move_before()
			{ P(focused,
			maybe(pluck('previousSibling')),
			maybe(PP(before, T(focused), focus))) }

		function move_after()
			{ P(focused,
			maybe(pluck('nextSibling')),
			maybe(PP(after, T(focused), focus))) } }

	main() }

if (document.readyState === 'complete')
	wrangling_keystrokes(window)
else
	window.addEventListener('load', () => wrangling_keystrokes(window))
