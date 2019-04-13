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

	async function main(url) {
		let counter = 1
		const parser = new DOMParser()
		const results = window.open()
		const doc = results.document
		doc.write("<meta charset='utf-8'><pre>")
		while (url !== null) {
			doc.title = `${counter} pages deep`
			counter++
			const dom = parser.parseFromString(await get(url), "text/html")
			doc.write(business(dom).join("\n") + "\n")
			const next = get_next(dom)
			url = next ? next.href : null
			await sleep(3000) }
		doc.write("</pre>")
		doc.title = "Done!"
		alert("Done!") }
	
	main(window.location.href)
})()
