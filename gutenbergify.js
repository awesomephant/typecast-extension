const baseURL = 'http://avh-sammlung.de/max'
const testPath = '/word-images/gutenberg-2/ut-0.png'

function traverseDOM() {

}


function replaceText(parent) {
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
        let height = 30;
        el.innerText = ''
        for (let j = 0; j < words.length; j++) {
            let imgEl = document.createElement('img')
            imgEl.setAttribute('src', `${baseURL}${testPath}`)
            imgEl.setAttribute('height', height)
            imgEl.setAttribute('style', `margin-right: 2px; display: inline-block; width: auto`)
            el.appendChild(imgEl)
        }
    }
}

replaceText(document.querySelector('body'));