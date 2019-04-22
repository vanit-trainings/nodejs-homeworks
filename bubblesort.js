
function swap(arr1, x, y) {
  let tmp;
  tmp = arr1[x];
  arr1[x] = arr1[y];
  arr1[y] = tmp;
}
var arr = [1,2,6,1,5,8,9,11,5]
console.log(arr.sort())
    for(var i = 0;i < arr.length;i++)
        {for(var j = 0;j<=arr.length-1;j++)
            if(arr[j]>arr[j+1])
            swap(arr, j,j+1)
        }
        console.log(arr)


