javascript:!function(){"use strict";const t=t=>async e=>(await t(e),e),e=t=>e=>e[t],n=t=>(function*(e){let n=0;for(const a of e)yield t(a,n++,e)}),a=t=>e=>async n=>{let a=e;for await(const e of n)a=await t(e)(a);return a},o=t=>t,r=t=>e=>e.querySelector(t),i=t=>e=>e.querySelectorAll(t),l=(t,...e)=>a(o)(t)(e),c=t=>e=>new Promise(n=>setTimeout(()=>n(e),t)),s=()=>0===(new Date).getDay(),u=()=>RegExp("^/tags/No Fandom/wrangle").test(location.pathname),m=new DOMParser,f=t=>m.parseFromString(t,"text/html"),y=t=>t.text(),d=e=>t(t=>e.parentElement.insertBefore(t,e)),w=t=>document.createElement(t);!async function(){s()?alert("Don't run this script on Sundays"):u()?alert("Don't run this script on No Fandom"):(document.title="Fetching...",await l(w("textarea"),d(r("table")(document)),o=>a(e=>t(t=>t.value+="\n"+e))(o)(async function*(a){let o=a,s=0;for(;o;)yield*await l(o,fetch,y,f,t(t=>o=r('a[rel="next"]')(t)),i('tr th[title="tag"] label'),n(e("innerHTML")),t=>c(s++<1e3?3e3:1e4)(t))}(location.href))),aletrn(document.title="Done!"))}()}();
