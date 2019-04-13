(function(){
	const stylesheet = "table { border-collapse: collapse; border: 1px solid black; width: 100%; } td, th { padding: 4px; } tr:nth-child(even) { background: #eee; } th { background: #eFe; }"
	const get = url => new Promise(resolve => {
		const req = new XMLHttpRequest()
		req.onload = x => resolve(req.responseText)
		req.open("GET", url)
		req.send() })

	const business = dom => Array.from(dom.querySelectorAll("tbody > tr")).map(parse_row)
	
	const get_attr = (obj, attr) => obj === null ? null : obj[attr]
	
	const parse_canonical = elem => {
		if (elem.innerHTML === "Unwrangleable")
			return "unwrangleable"
		else if (elem.innerHTML === "Yes")
			return "yes"
		else
			return "no"
	}
	
	const parse_characters = xs => xs === null ? null : Array.from(xs).map(x => x.innerHTML)
	
	const parse_row = elem => ({
		tag: elem.querySelector("th > label").innerHTML,
		canonical: parse_canonical(elem.querySelector("td[title='canonical?']")),
		syn: get_attr(elem.querySelector("td[title='metatag or synonym'] a"), "innerHTML"),
		created: elem.querySelector("td[title='created']").innerHTML,
		taggings: elem.querySelector("td[title='taggings']").innerHTML,
		characters: parse_characters(elem.querySelectorAll("td[title='characters'] li a"))
	})

	const get_next = dom => dom.querySelector("a[rel='next']")
	
	const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
	
	const serialise = x => `<tr><td>${x.tag}</td> <td>${x.canonical}</td> <td>${x.syn}</td> <td>${x.created}</td> <td>${x.taggings}</td> <td>${x.characters === null ? null : x.characters.join("<br/>")}</td></tr>`

	async function main(url) {
		let counter = 1
		const parser = new DOMParser()
		const results = window.open()
		const doc = results.document
		doc.write("<meta charset='utf-8'><table><tr>")
		doc.write("<style>" + stylesheet + "</style>")
		doc.write(["tag", "canonical", "syn", "created", "taggings", "characters"].map(x => `<th>${x}</th>`).join(""))
		doc.write("</tr>")
		while (url !== null) {
			doc.title = `${counter} pages deep`
			counter++
			const dom = parser.parseFromString(await get(url), "text/html")
			doc.write(business(dom).map(serialise).join(""))
			const next = get_next(dom)
			url = next ? next.href : null
			await sleep(3000) }
		doc.write("</table>")
		doc.title = "Done!"
		alert("Done!") }
	
	main(window.location.href)
})()
