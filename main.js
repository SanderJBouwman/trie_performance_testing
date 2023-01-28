
let items = [];
let results = [];
let ready = false

class Trie {
    constructor() {
        this.root = new TrieNode(null);
        this.resultMap = {}
    }

    insert(word, result) {
        word = word.toLowerCase();
        if (word in this.resultMap) {
            this.resultMap[word].push(result)
        } else {
            this.resultMap[word] = [result]
        }
        let node = this.root;
        for (let character of word) {
            if (!node.children.has(character))
                node.children.set(character, new TrieNode(character));
            node = node.children.get(character);
        }
        node.isEnd = true;
    }

    search(word) {
        word = word.toLowerCase()
        let res = [];
        let node = this.root;
        for (let ch of word) {
            if (node.children.has(ch))
                node = node.children.get(ch);
            else
                return res;
        }
        this.autocomplete(node, res, word.substring(0, word.length - 1));
        return res.map(re => this.resultMap[re]);
    }

    autocomplete(node, res, prefix) {
        if (node.isEnd)
            res.push(prefix + node.data);
        for (let c of node.children.keys())
            this.autocomplete(node.children.get(c), res, prefix + node.data);
    }
}


class TrieNode {

    constructor(character) {
        this.data = character;
        this.isEnd = false;
        this.children = new Map();
    }
}

let trie = new Trie();

function regularSearch(text, items) {
    let searchResults = [];
    for (const item of items) {
        if (item.includes(text)) {
            searchResults.push(item);
            trie.insert(item, item);
        }
    }
    return searchResults;
}

function addResults(result, results) {
    results.push(result);
    updateResults(results);
}

function updateResults(results){
    // get table with id resultTable
    let table = document.getElementById("resultTable");
    // clear table
    table.innerHTML = "";
    // add header
    let header = table.createTHead();
    let row = header.insertRow(0);
    let cell = row.insertCell(0);
    cell.innerHTML = "<b>Method</b>";
    cell = row.insertCell(1);
    cell.innerHTML = "<b>Time(ms)</b>";
    cell = row.insertCell(2);
    cell.innerHTML = "<b>Items</b>";
    cell = row.insertCell(3);
    cell.innerHTML = "<b>Query</b>";

    // add rows
    for (const result of results) {

        row = table.insertRow(-1);
        cell = row.insertCell(0);
        cell.innerHTML = result.method;
        cell = row.insertCell(1);
        cell.innerHTML = result.time;
        cell = row.insertCell(2);
        cell.innerHTML = result.nItems;
        cell = row.insertCell(3);
        cell.innerHTML = result.query;

    }
}


function loadData() {
    fetch('http://localhost:63343/words_alpha.txt')
        .then(response => response.text())
        .then((data) => {
            let lines = data.split("\n");
            for (const line of lines) {
                items.push(line.trim());
            }
            ready = true;
        })
}

function clearResults(){
    // Clear the myInput field
    document.getElementById("myInput").value = "";
    results = [];
    updateResults(results);
}


function getRandomWords(items, minLength, maxLength, nWords) {
    // This function will create a object with key 1 - 10 and value which is an array of 10 random words with the length of the key
    let randomWords = {};
    for (let i = minLength; i <= maxLength; i++){
        // check if i is a key in randomWords
        if (!(i in randomWords)){
            randomWords[i] = [];
        }
        while (randomWords[i].length !== nWords){
            let randomWord = items[Math.floor(Math.random() * items.length)];
            if (randomWord.length === i){
                if (!randomWords[i].includes(randomWord)){
                    randomWords[i].push(randomWord);
                }
            }
        }

    }

    console.log(randomWords);

    return randomWords;
}

function searchWords(randomWords) {
    // This function will search for the random words and return the results
    let results = [];

    // count the total amount of words
    let totalWords = 0;
    for (const key in randomWords) {
        totalWords += randomWords[key].length;
    }

    // count the amount of words that are found
    let wordN = 0;
    for (const key in randomWords) {
        let words = randomWords[key];
        for (const word of words) {
            wordN += 1
            console.log(`Progress: ${wordN}/${totalWords}: Searching for word ${word}`);
            let regularTimeStart = window.performance.now()
            let regularResults = regularSearch(word, items);
            let regularTimeSpeed = window.performance.now() - regularTimeStart;
            addResults({method: "regular", time: regularTimeSpeed, "nItems": regularResults.length, "query": word}, results);

            let trieTimeStart = window.performance.now();
            let trieResults = trie.search(word);
            let trieTimeSpeed = window.performance.now() - trieTimeStart;
            addResults({method: "trie", time: trieTimeSpeed, "nItems": trieResults.length, "query": word}, results);
        }
    }
}


function runTest() {
    // Disable the button
    document.getElementById("runTest").disabled = true;
    let minLength = 3;
    let maxLength = 20;
    let nWords = 15;
    let randomWords = getRandomWords(items, minLength, maxLength, nWords);
    searchWords(randomWords);
    // Enable the button
    document.getElementById("runTest").disabled = false;
}

// On document ready
$(document).ready(function () {
    // make a listener that checks if ready is true and if so enables myInput
    let interval = setInterval(function () {
        if (ready) {
            clearInterval(interval);
            console.log("Loaded " + items.length + " word");
            runTest();
        }
    }, 100);

    loadData();
});


