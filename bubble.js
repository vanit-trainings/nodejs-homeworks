const readline = require('readline-sync');

let arr = [];
let i = 0;
let arrObj = "";

function bubble(arr)
{
    for(let i = 0; i < arr.length; i++){
        for(let j = (i + 1); j<arr.length; j++){
            compare(arr, i, j);
        }
    }
}

function compare(arr, x, y){  
    if(arr[x] > arr[y])
    {
        let tmp = arr[x];
        arr[x] = arr[y];
        arr[y] = tmp;
    }
}

while(arrObj !== "q"){
    arrObj = readline.question("Enter an array element, if You have entered enough elements enter 'q' \n");    
    
    if (!isNaN(Number(arrObj))) 
    { 
        arr[i] = Number(arrObj);
        i++;
    }
}


console.log("Your array");
console.log(arr);
bubble(arr);
console.log("Sort array");
console.log(arr);