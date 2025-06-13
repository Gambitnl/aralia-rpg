(function(){
    window.openTownView = function(townId, environment) {
        const url = new URL('town_view.html', window.location.origin);
        if (townId) url.searchParams.set('town', townId);
        const env = environment || sessionStorage.getItem('currentEnvironment') || 'plains';
        url.searchParams.set('env', env);
        window.location.href = url.toString();
    };
})();
