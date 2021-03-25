(function(){
	'use strict'
	const tap = f => async (x) => { await f(x) ; return x }
	const pluck = k => x => x[k]
	const map = f => function* (xs) { let i = 0 ; for (const x of xs) yield f(x, i++, xs) }
	const reduce = f => i => async (xs) => { let a = i ; for await (const x of xs) a = await f(x)(a) ; return a }
	const I = x => x
	const qs = x => d => d.querySelector(x)
	const qss = x => d => d.querySelectorAll(x)
	const pipe = async (x, ...fs) => reduce(I)(x)(fs)
	const get_next = qs('a[rel="next"]')
	const wait = x => v => new Promise(ok => setTimeout(() => ok(v), x))
	const is_sunday = () => new Date().getDay() === 0
	const is_nf = () => RegExp('^/tags/No Fandom/wrangle').test(location.pathname)
	const parser = new DOMParser()
	const parse = x => parser.parseFromString(x, 'text/html')
	const text = x => x.text()
	const before = p => tap(x => p.parentElement.insertBefore(x, p))
	const elem = x => document.createElement(x)

	async function* results_generator(x)
		{ let url = x, c = 0
		while (url !== null) yield* await pipe
			(url, fetch, text, parse,
			tap(x => url = get_next(x)),
			qss('tr th[title="tag"] label'),
			map(pluck('innerHTML')),
			x => wait(c++ < 1000 ? 3e3 : 10e3)(x))

	async function main()
		{ if (is_sunday())
			return alert("Don't run this script on Sundays")
		else if (is_nf())
			return alert("Don't run this script on No Fandom")
		document.title = 'Fetching...'
		await pipe
			(elem('textarea'),
			before(qs('table')(document)),
			e => reduce(x => tap(e => e.value += '\n' + x))(e)(results_generator(location.href)))
		document.title = 'Done!'
		alert('Done!') }

	main()
})()
