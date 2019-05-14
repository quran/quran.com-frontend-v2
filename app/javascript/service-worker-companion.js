if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(function(registration) {
            console.log('Quran.com SW Registered:', registration);
        })
        .catch(function(error) {
            console.log('Quran.com SW Registration failed: ', error);
        });
}
