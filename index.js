const express = require('express');

const app = express();

app.use(express.static('static'));

const arr = [];

function getDisplay(instructionText, array){
    //console.log(instructionText);
    //console.log(array);
    arr.push(instructionText);
    arr.push(array);

}


const _mergeArrays = (a, b) => {
    const c = []

    // If both a and b both have values left, push the smaller of indicies 0 to c
    while (a.length && b.length) {
        getDisplay("If both a and b both have values left, push the smaller of indicies 0 to c", c)
        c.push(a[0] > b[0] ? b.shift() : a.shift()) // OUTPUT each 'choice' as it's made
    }
    
    //if we still have values, let's add them at the end of `c` (OUTPUT that when one array is empty, just put the other ones back in order)
    while (a.length) {
        getDisplay("if we still have values, let's add them at the end of `c`", c)
        c.push(a.shift())
    }
    while (b.length) {
        getDisplay("if we still have values, let's add them at the end of `c`", c)
        c.push(b.shift())
    }

  return c // final OUTPUT as a culmination of 'choices'
}

// a is the first set of numbers we show to the user (OUTPUT)
const mergeSort = (a) => {
    getDisplay("a is the first set of numbers we show to the user", a)
    // base case for recursion - if the array only has 1 value, it cannot be split further (OUTPUt that it cannot be split further)
    if (a.length < 2) return a
    // determining where the middle point would be in the array, which is how the two equal lengths will be separated
    const middle = Math.floor(a.length / 2)
    // split the arrays into two equal lengths, these are the two split sets (OUTPUT - show the split subarrays)
    const a_l = a.slice(0, middle)
    const a_r = a.slice(middle, a.length)
    getDisplay("split the arrays into two equal lengths, these are the two split sets (OUTPUT - show the split subarrays)", a_l + " /// " + a_r)

    // recursively merge sort on the left and right subarrays
    const sorted_l = mergeSort(a_l)
    const sorted_r = mergeSort(a_r)
    // when the recursive calls are returned (i.e. array has been split as far as possible), merge the subarrays in sorted order

    
    return _mergeArrays(sorted_l, sorted_r)
}

// function to create array of random numbers with specified length and number range and run mergesort algorithm
function runAlgo(list, size, range){
    // declare variable to hold array to be sorted
    //let list = [];
    // loop to fill array of specified length
    for(let i = 0; i < size; i++){
        // store random number in range in variable "num"
        let num = (Math.floor(Math.random() * range) + 1);
        // checks if the number generated is in the array
        if (list.includes(num)){
            // if the number is already in the array the counter is decremented so that the step is repeated
            i--;
        }
        // if the number is not in the array push it to the array
        else{
            list.push(num);   
        }
    }
    // call the merge sort algorithm for the generated list and print it to console
    //console.log(mergeSort(list));
    mergeSort(list);
    
}

//let length = 10;
//let max = 20;
//runAlgo(length, max);



app.get('/array', (req, res) => {

    let content= '';

    let list = [];
    runAlgo(list, 10, 20);

    content += list;
   
    res.send(content);
})

app.get('/array2', (req, res) => {

    res.send(JSON.stringify(arr));
})

app.listen(2005);
