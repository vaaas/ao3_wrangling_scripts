(function(){
	const get = url => new Promise(resolve => {
		const req = new XMLHttpRequest()
		req.onload = x => resolve(req.responseText)
		req.open("GET", url)
		req.send() })

	const pluck = attr => obj => obj[attr]

	const business = dom => Array.from(dom.querySelectorAll("tr th[title='tag'] label")).map(pluck("innerHTML"))

	const get_next = dom => dom.querySelector("a[rel='next']")
	
	const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

	const is_sunday = () => (new Date).getDay() === 0

	const is_nf = () => RegExp("^/tags/No Fandom/wrangle").test(location.pathname)

	async function main(url) {
		if (is_sunday())
			return alert("Don't run this script on Sundays")
		else if (is_nf())
			return alert("Don't run this on No Fandom")
		let counter = 1
		const parser = new DOMParser()
		const results = open()
		const doc = results.document
		doc.write("<meta charset='utf-8'><pre>")
		while (url !== null) {
			doc.title = `${counter} pages deep`
			counter++
			const dom = parser.parseFromString(await get(url), "text/html")
			doc.write(business(dom).join("\n") + "\n")
			const next = get_next(dom)
			url = next ? next.href : null
			await sleep(counter < 1000 ? 3000 : 10000) }
		doc.write("</pre>")
		doc.title = "Done!"
		alert("Done!") }
	
	main(location.href)
})()
