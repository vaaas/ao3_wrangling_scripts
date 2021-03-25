(function(){
	'use strict'
	const tap = f => x => { f(x) ; return x }
	const pluck = k => x => x[k]
	const map = f => function* (xs) { let i = 0 ; for (const x of xs) yield f(x, i++, xs) }
	const reduce = f => i => xs => { let a = i ; for (const x of xs) a = f(x)(a) ; return a }
	const I = x => x
	const qs = x => d => d.querySelector(x)
	const qss = x => d => d.querySelectorAll(x)
	const compl = (...fs) => x => reduce(I)(x)(fs)
	const business = compl(qss('tr th[title="tag"] label'), map(pluck('innerHTML')))
	const get_next = qs('a[rel="next"]')
	const sleep = x => new Promise(ok => setTimeout(ok, x))
	const is_sunday = () => new Date().getDay() === 0
	const is_nf = () => RegExp('^/tags/No Fandom/wrangle').test(location.pathname)
	const parser = new DOMParser()
	const parse = x => parser.parseFromString(x, 'text/html')
	const text = x => x.text()
	const before = p => tap(x => p.parentElement.insertBefore(x, p))
	const elem = x => document.createElement(x)

	async function* results_generator(x)
		{ let url = x
		let c = 0
		while (url !== null)
			{ yield* await fetch(url)
				.then(text)
				.then(parse)
				.then(tap(x => url = get_next(x)))
				.then(business)
			await sleep(c++ < 1000 ? 3e3 : 10e3) }}

	async function main()
		{ if (is_sunday())
			return alert("Don't run this script on Sundays")
		else if (is_nf())
			return alert("Don't run this script on No Fandom")
		const results = before(qs('table')(document))(elem('textarea'))
		document.title = 'Fetching...'
		for await (const x of results_generator(location.href))
			results.value += '\n' + x
		document.title = 'Done!'
		alert('Done!') }

	main()
})()
