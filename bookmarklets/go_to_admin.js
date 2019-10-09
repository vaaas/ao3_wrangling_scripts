(function(){
const match = location.pathname.match(new RegExp("^/users/([^/]+)"))
if (match[1]) location.pathname = `/admin/users/${match[1]}`
})()
