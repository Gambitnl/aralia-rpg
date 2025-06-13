(function(){
    window.openTownView = function(townId, environment) {
        const url = new URL('town_view.html', window.location.href);
        if (townId) url.searchParams.set('town', townId);
        if (environment) url.searchParams.set('env', environment);
        window.location.href = url.toString();
    };
})();
