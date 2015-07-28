function support_app() {
    return Date.now
        && window.JSON
        && document.querySelector
        && Object.observe;
}