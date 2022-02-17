var file; //Most Recent Download File
var db; //Database Object

//Convert database object to JSON file
function jsonToFile(obj) {
  var text = new Blob([JSON.stringify(obj)], {type: "text/plain;charset=utf-8"});

  if (file !== null) {
    window.URL.revokeObjectURL(file);
  }
  else {
    console.log("Database null.")
    alert("Database is null so cannot be downloaded.");
  }

  return (file = window.URL.createObjectURL(text));
};

//Make download button interactive
function downloadListener() {
  var link = document.createElement("download");
  link.setAttribute("download", "dnd.json");
  link.href = jsonToFile(db);
  document.body.appendChild(link);
  
  window.requestAnimationFrame(function() {
    var event = new MouseEvent("click");
    link.dispatchEvent(event);
    document.body.removeChild(link);
  });
}

//Convert uploaded JSON file to database object
function fileToJSON(event) {
  try {
    db = JSON.parse(event.target.result);
  }
  catch (error) {
    console.log(error);
    alert("Uploaded file is not a valid JSON file.");
  }
}

//Make upload button interactive
function uploadListener(event) {
  if (event.target.files !== null && event.target.files[0] !== null) {
    var reader = new FileReader();
    reader.onload = fileToJSON;
    reader.readAsText(event.target.files[0]);
  }
}

//Example button definitions
var download = document.getElementById("id-of-download-button").addEventListener("click", downloadListener); //Create Download Button
var upload = document.getElementById("id-of-upload-button").addEventListener("change", function(e) { uploadListener(e); }); //Create Upload Button