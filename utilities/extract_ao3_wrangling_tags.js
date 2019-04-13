#!/usr/bin/env node

const https = require("https")
const jsdom = require("jsdom")
const fs = require("fs")

function get(url, cookie) {
	return new Promise((resolve, reject) => {
		https.get(url, {"headers":{"Cookie": cookie}}, res => {
			let data = ""
			res.on("data", part => {
				data += part
			})
			res.on("end", () => resolve(data))
			res.on("error", (error) => reject(error))
		})
	})
}

function map(collection, fn) {
	const arr = []
	for (let i = 0, len = collection.length; i < len; i++)
		arr.push(fn(collection[i], i, collection))
	return arr
}

const pluck = attr => obj => obj[attr]

function business(dom) {
	return map(dom.window.document.querySelectorAll("tr th[title='tag'] label"), pluck("innerHTML"))
}

function get_next(dom) {
	return dom.window.document.querySelector("a[rel='next']")
}

function sleep(ms) {
	return new Promise((res, rej) => { setTimeout(res, ms) })
}

async function main(url) {
	const cookie = fs.readFileSync("cookie", {"encoding": "utf8"}).trim()
	while(true) {
		const dom = new jsdom.JSDOM(await get(url, cookie))
		business(dom).forEach(i=>console.log(i))
		const next = get_next(dom)
		if (next === null) return
		else url = `https://archiveofourown.org${next.href}`
		await sleep(3000)
	}
}

main(process.argv[2])
