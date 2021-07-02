export function getSearchParams() {
    return new URLSearchParams(location.hash.substr(1))
}


export function setSearchParams(searchParams, titleSuffix) {
    let title = document.title;
    if (titleSuffix) {
      title += ' - ' + titleSuffix
    }
    let url = '#' + searchParams.toString()
    history.replaceState(null, title, url)
}