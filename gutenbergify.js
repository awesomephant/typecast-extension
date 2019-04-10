const baseURL = 'http://avh-sammlung.de/max/word-images/gutenberg-2'
const testPath = '/word-images/gutenberg-2/ut-0.png'

const source = {
    id: 'gutenberg'
}

var wordList;

const gri = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const loadJSON = function (source, callback) {
    console.log('Loading wordlist..')
    let url = browser.runtime.getURL('wordlist-gutenberg-2.json')
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            console.log('Loaded wordlist')
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

const isUpperCase = function (s) {
    if (s.toUpperCase() === s) {
        return true;
    } else {
        return false
    }
}

const hasDescender = function (word) {
    if (word.match(/[Qqypgj]/g) != null) {
        return true
    }
    return false
}
const hasAscender = function (word) {
    if (word.match(/[dfhklbABCDEFGHIJKLMNOPQRSTUVXYZ]/g) != null) {
        return true
    }
    return false
}
const hasSmallAscender = function (word) {
    if (word.match(/[it]/g) != null) {
        return true
    }
    return false
}

const findClosestWord = function (word) {
    let dmin = 99999;
    let closest;
    console.log(wordList.length)
    for (let i = 0; i < wordList.length; i++) {
        let l = new Levenshtein(word, wordList[i].text.toString())
        if (l.distance < dmin) {
            dmin = l.distance
            closest = wordList[i]
        }
    }
    return closest
}



function replaceText(parent) {
    console.log('Replacing words..')
    let allElements = parent.querySelectorAll(`*`)
    // First, let's make sure that ever bit of text is contained inside an element
    for (let i = 0; i < allElements.length; i++) {
        let el = allElements[i];
        for (let j = 0; j < el.childNodes.length; j++) {
            let node = el.childNodes[j];
            if (node.nodeName === '#text') {
                let spanEl = document.createElement('span')
                spanEl.innerText = node.data
                spanEl.classList.add('GUTENBERG-text')
                spanEl.style.display = 'inline'
                el.appendChild(spanEl)
                node.data = ''
            }
        }
    }

    let textElements = document.querySelectorAll('.GUTENBERG-text')
    for (let i = 0; i < textElements.length; i++) {
        let el = textElements[i];
        let words = el.innerText.split(' ');
        let height = 50;
        el.innerText = ''
        for (let j = 0; j < words.length; j++) {
            if (words[j].length > 1) {
                let closest = findClosestWord(words[j]);
                let imgEl = document.createElement('img')
                imgEl.setAttribute('src', `${baseURL}/${closest.text}-0.png`)
                imgEl.setAttribute('height', height)
                imgEl.classList.add('gutenberg-image')
                el.appendChild(imgEl)
            }
        }
    }

    document.body.setAttribute('gutenberg-done', 'true')
}

loadJSON(source, function (data) {
    wordList = JSON.parse(data);
    let active = document.body.getAttribute('gutenberg-done')
    if (active != 'true') {
        replaceText(document.querySelector('body'));
    }
})