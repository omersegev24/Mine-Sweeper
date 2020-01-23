
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function printMat(mat, selector) {
  var strHTML = '';
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < mat[0].length; j++) {
      var cellText = EMPTY;
      
      var className = 'cell cell' + i + '-' + j;
      strHTML += `<td onmousedown="cellMarked(this, event , ${i}, ${j})"
       onclick="cellClicked(this, ${i}, ${j})"  class="${className}"> ${cellText} </td>`;
    }
    strHTML += '</tr>'
  }
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
}

