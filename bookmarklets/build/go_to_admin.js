javascript:(function(){const n=location.pathname.match(new RegExp("^/users/([^/]+)"));if(n[1])location.pathname=`/admin/users/${n[1]}`})();
