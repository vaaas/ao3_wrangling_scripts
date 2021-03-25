(async()=>{
	const D = document
	const L = location
	const tap = f => async (x) => { await f(x) ; return x }
	const pluck = k => x => x[k]
	const map = f => function* (xs) { for (const x of xs) yield f(x) }
	const reduce = f => i => async (xs) => { let a = i ; for await (const x of xs) a = await f(x)(a) ; return a }
	const I = x => x
	const qs = x => d => d.querySelector(x)
	const qss = x => d => d.querySelectorAll(x)
	const pipe = (x, ...fs) => reduce(I)(x)(fs)
	const wait = x => v => new Promise(ok => setTimeout(() => ok(v), x))
	const parser = new DOMParser()
	const parse = x => parser.parseFromString(x, 'text/html')
	const text = x => x.text()
	const before = p => tap(x => p.parentElement.insertBefore(x, p))
	const elem = x => D.createElement(x)
	const AL = alert

	async function* results_generator(x)
		{ let url = x, c = 0
		while (url) yield* await pipe
			(url, fetch, text, parse,
			tap(x => url = qs('a[rel="next"]')(x)),
			qss('tr th[title="tag"] label'),
			map(pluck('innerHTML')),
			x => wait(c++ < 1000 ? 3e3 : 10e3)(x)) }

	if (new Date().getDay() === 0)
		AL("Don't run this script on Sundays")
	else if (RegExp('^/tags/No Fandom/wrangle').test(L.pathname))
		AL("Don't run this script on No Fandom")
	else
		{ D.title = 'Fetching...'
		await pipe
			(elem('textarea'),
			before(qs('table')(D)),
			e => reduce(x => tap(e => e.value += '\n' + x))(e)(results_generator(L.href)))
		AL(D.title = 'Done!') }
})()
