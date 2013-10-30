// Saves options to localStorage.
function save_options() {
  var select = document.getElementById("time");
  var time = parseInt(select.children[select.selectedIndex].value);
  localStorage["total_time"] = time;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var total_time = localStorage["total_time"];
  if (!total_time) {
    return;
  }
  var select = document.getElementById("time");
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (parseInt(child.value) == total_time) {
      child.selected = "true";
      break;
    }
  }
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);