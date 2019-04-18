const source = {
    id: 'gutenberg'
}

var wordList;

const gri = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const loadJSON = function (source, callback) {
    console.log('Loading wordlist..')
    let url = browser.runtime.getURL('wordlist-gutenberg.json')
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
    for (let i = 0; i < wordList.length; i++) {
        let l = new Levenshtein(word, wordList[i].text.toString())
        if (l.distance < dmin) {
            dmin = l.distance
            closest = wordList[i]
        }
    }
    return closest
}



var progressEl;
var globalProgress = 0;

function updateProgress(i, n) {
    if (i){
        let h1 = document.querySelector('.gutenberg--loading-screen h1')
        progressEl.innerHTML = `${i}/${n}`;
    }
}

var i = 0;
var j = 0;
var replaceLoop;
var textElements

function replaceWords() {
    //console.log(`Replacing element ${i}, word ${j}`)
    updateProgress(i, textElements.length)
    if (i < textElements.length) {
        let el = textElements[i];
        let words = el.innerText.split(' ');
        console.log(el)
        let css = window.getComputedStyle(el);
        let height = css.getPropertyValue('font-size');
        height = height.substring(0, height.length - 2)
        el.innerText = '';
        for (let j = 0; j < words.length; j++) {
            if (words[j].length > 1) {
                let closest = findClosestWord(words[j]);
                let imgEl = document.createElement('img')
                let version = 0
                //let version = gri(0, closest.count - 1)
                let url = browser.runtime.getURL(`/word-images/${closest.text}-${version}.png`)
                imgEl.setAttribute('src', url)
                imgEl.setAttribute('style', `height: ${height * 1.5}px !important`)
                imgEl.classList.add('gutenberg-image')
                el.appendChild(imgEl)
            }
        }
        i++;
        requestAnimationFrame(replaceWords)
    } else {
        document.body.setAttribute('gutenberg-done', 'true')
    }
}


function replaceText(parent) {
    console.log('Replacing words..')
    let allElements = parent.querySelectorAll(`*`)
    console.log(allElements)
    // First, let's make sure that ever bit of text is contained inside an element
    for (let i = 0; i < allElements.length; i++) {
        let el = allElements[i];
        for (let j = 0; j < el.childNodes.length; j++) {
            let node = el.childNodes[j];
            if (node.nodeName === '#text') {
                let spanEl = document.createElement('span')
                spanEl.innerText = node.data.trim()
                spanEl.setAttribute('height', el.clientHeight)
                spanEl.classList.add('GUTENBERG-text')
                spanEl.style.display = 'inline'
                el.appendChild(spanEl)
                node.data = ''
            }
        }
    }
    textElements = document.querySelectorAll('.GUTENBERG-text');
    requestAnimationFrame(replaceWords)
}

let loadingScreen = document.createElement('div');
loadingScreen.classList.add('gutenberg--loading-screen')
loadingScreen.innerHTML = `<h1><i>L</i><i>o</i><i>a</i><i>d</i><i>i</i><i>n</i><i>g</i></h1>`
document.body.appendChild(loadingScreen)

progressEl = document.createElement('div')
progressEl.classList.add('gutenberg--progress')
loadingScreen.appendChild(progressEl)

loadJSON(source, function (data) {
    wordList = JSON.parse(data);
    let active = document.body.getAttribute('gutenberg-done')
    window.setInterval(function () {
        updateProgress(globalProgress)
    }, 100)

    if (active != 'true') {
        replaceText(document.querySelector('body'));
    }
})