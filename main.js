/**
 * @file main.js
 *
 * @desc A JavaScript file that implements Trie and TrieNode data structures, along with helper functions.
 */

let items = [];
let results = [];
let ready = false


/**
 * @class Trie - A class that implements a Trie data structure.
 * @desc This class implements a Trie data structure, with helper functions to insert a word, search for a word, and autocomplete a word.
 *
 */
class Trie {
    constructor() {
        this.root = new TrieNode(null);
        this.resultMap = {}
    }

    /**
     * @method insert
     * @desc This function inserts a word into the Trie and stores the corresponding result in the result map.
     * @param {string} word - The word to be inserted into the Trie.
     * @param {string} result - The value to be associated with the word.
     * @returns {void} - This function does not return anything.
     */
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

    /**
     * @method search
     * @param word - The word to be searched for in the Trie.
     * @return {*[]} - Returns an array of results associated with the word.
     */
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

    /**
     * @method autocomplete - This function is a helper function for the search function. It recursively traverses the Trie and returns all the words that are associated with the given node.
     * @param node - The node to start the traversal from.
     * @param res - The array to store the results in.
     * @param prefix - The prefix that was used to get to the given node.
     */
    autocomplete(node, res, prefix) {
        if (node.isEnd)
            res.push(prefix + node.data);
        for (let c of node.children.keys())
            this.autocomplete(node.children.get(c), res, prefix + node.data);
    }
}


/**
 * @class TrieNode - A class that implements a TrieNode data structure.
 * @desc This class implements a very simple TrieNode data structure.
 * @param data - The data to be stored in the TrieNode.
 * @constructor
 * @returns {TrieNode} - Returns a TrieNode object.
 * @property {string} data - The data stored in the TrieNode.
 * @property {boolean} isEnd - A boolean value that indicates whether the TrieNode is the end of a word.
 * @property {Map} children - A Map object that stores the children of the TrieNode.
 */
class TrieNode {
    constructor(character) {
        this.data = character;
        this.isEnd = false;
        this.children = new Map();
    }
}

let trie = new Trie();

/**
 * @function regularSearch - This function searches for text in a list of words using includes() method. It returns the words that contain the given text.
 * @param text - The text to be searched for.
 * @param words - The list of words to search in.
 */
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


/**
 * @function updateResults - This function updates the results table. It clears the table and adds the results to the table.
 * @param results - The array of results to be added to the table.
 */
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


/**
 * @function loadData - This function loads the data from the words_alpha.txt file and stores it in the items array.
 * @returns {Promise<void>} - This function returns a Promise object.
 */
function loadData() {
    return new Promise((resolve, reject) => {
        fetch('https://raw.githubusercontent.com/devalk96/trie_performance_testing/master/words_alpha.txt')
            .then(response => response.text())
            .then(text => {
                items = text.split('\n');
                resolve(true);
            })
            .catch(error => {
                console.log(error);
                reject(false);
            }).then(() => {
        console.log("Data loaded successfully from: https://raw.githubusercontent.com/devalk96/trie_performance_testing/master/words_alpha.txt");
        console.log(`Loaded ${items.length} words`);
    })

})}

function clearResults(){
    updateResults([]);
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
    return randomWords;
}

/**
 * @function copyTableToClipboard - This function copies the results table to the clipboard. And changes the copy button text to "Copied".
 * @param table - The table to be copied.
 */
function copyTableToClipboard(table) {
    // check if table has rows if not alert that there is no data to copy
    if (table.rows.length === 0){
        alert("There is no data to copy");
        return;
    }

    // Copy to clipboard
    let urlField = table
    let range = document.createRange()
    range.selectNode(urlField)
    window.getSelection().addRange(range)
    document.execCommand('copy')
    window.getSelection().removeAllRanges()

    // change the text of the button to Copied for 2 seconds
    let copyButton = document.getElementById("copyTable");
    copyButton.innerHTML = "Copied!";
    setTimeout(() => {
        copyButton.innerHTML = "Copy table to clipboard";
    }, 2000);
}

/**
 * @function searchWords - This function searches for words in the items array using the regularSearch() and trie.search() functions. It returns the results in an array.
 * @param randomWords - The object that contains the random words to be searched for.
 * @return {*[]} - Returns an array of objects that contain the results.
 */
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

            let regularTimeStart = window.performance.now()
            let regularResults = regularSearch(word, items);
            let regularTimeSpeed = window.performance.now() - regularTimeStart;
            results.push({method: "regular", time: regularTimeSpeed, "nItems": regularResults.length, "query": word})

            let trieTimeStart = window.performance.now();
            let trieResults = trie.search(word);
            let trieTimeSpeed = window.performance.now() - trieTimeStart;
            results.push({method: "trie", time: trieTimeSpeed, "nItems": trieResults.length, "query": word})
        }
    }
    return results;
}

/**
 * @function runTest - This function runs the test and updates the results table.
 * @return {*[]}
 */
function runTest() {
    $button = $("#runTestButton");
    $spinner = $("<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>");
    // if the button holds the data running = true we dont want to run the test again
    if ($button.data("running")){
        return;
    }

    // set the data running to true
    $button.data("running", true).text(" Running...").prop("disabled", true).prepend($spinner);

    // clear the results
    clearResults();

    let minLength = 3;
    let maxLength = 20;
    let nWords = 15;
    let randomWords = getRandomWords(items, minLength, maxLength, nWords);

    // We dont want to block the ui when we run the test
    setTimeout(() => {
        let results = searchWords(randomWords);
        updateResults(results);
        // set the data running to false
        $button.data("running", false)
            .text("Rerun test")
            .prop("disabled", false);

    });

    return results;
}


$(document).ready(function () {
    $button = $("#runTestButton");
    $button.data("running", false);
    $button.click(function () {
        runTest();
    })

    loadData().then(() => {
        $button.prop("disabled", false);
    })

    $("#copyTable").click(function () {
        console.log("copy table");
        let table = document.getElementById("resultTable");
        copyTableToClipboard(table);
    })
});


