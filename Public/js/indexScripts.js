document.addEventListener("DOMContentLoaded", () => {

// This script is used to update the folder name in the database and on the page
  document.querySelectorAll(".folderNameForm").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.stopPropagation(); // Stop propagation here
      console.log("Form submitted");
      event.preventDefault();
      const folderId = form.getAttribute("data-folder-id");
      const folderName = form.folderName.value;

      try {
        
        const response = await fetch(`/update-folder/${folderId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ folderName }),
        });

        if (!response.ok) {
          throw new Error("Failed to update folder name");
        }

        const result = await response.json();
        console.log("Folder updated:", result);

        // Update the DOM with the new folder name
        form.folderName.value = result.foldername;
      } catch (error) {
        console.error("Error updating folder name:", error);
      }
    });
  });


// This script is used to open form to add a folder to the database and on the page
let open = false;
const createFolderButton = document.querySelector(".createFolderButtonTop");
const htmlLocation = document.querySelector(".insertedFolderForm");
const folderCreationHtml = window.folderCreationHtml; // Access the variable from the window object
createFolderButton.addEventListener("click", () => {
  if (!open) {
    htmlLocation.innerHTML = folderCreationHtml;
    open = true;
  } else {
    htmlLocation.innerHTML = ``;
    open = false;
  }
});

// This script is used to delete a folder from the database and on the page

  document.querySelectorAll(".deleteFolderButton").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation(); // Stop propagation here
      const folderId = button.getAttribute("data-folder-id");
      const confirmDelete = button.previousElementSibling;
      button.style.display = "none";
      confirmDelete.style.display = "block";
    });
  });

  document.querySelectorAll(".confirmCancel").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation(); // Stop propagation here
      const confirmDelete = button.parentElement.parentElement.parentElement;
      const deleteButton = confirmDelete.nextElementSibling;
      confirmDelete.style.display = "none";
      deleteButton.style.display = "block";
    });
  });

  document.querySelectorAll(".confirmYes").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.stopPropagation(); // Stop propagation here
      const folderId = button.getAttribute("data-folder-id");
      try {
        const response = await fetch(`/delete-folder/${folderId}`, {
          method: "DELETE",
        });
        console.log("response:", response);

        if (!response.ok) {
          throw new Error("Failed to delete folder");
        }

        const result = await response.json();
        console.log("Folder deleted:", result);

        // Remove the folder from the DOM
        const folderElement = button.closest(".folder");
        folderElement.remove();
      } catch (error) {
        console.error("Error deleting folder:", error);
      }
    });
  });


// Script used to direct to folder page that shows all files in that folder
  document.querySelectorAll(".folder").forEach((folder) => {
    folder.addEventListener("click", async (event) => {
      event.stopPropagation(); // Stop propagation here

      const folderId = folder.getAttribute("data-folder-id");
      window.location.href = `/folder/${folderId}`;
    });
  });

 document.querySelectorAll(".folderName").forEach((input) => {
  console.log('input', input)
   input.addEventListener("click", async (event) => {
    
    event.stopPropagation()
   })
 })


});