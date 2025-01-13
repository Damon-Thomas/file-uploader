
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");
  try {
    const fileUploadForm = document.getElementById("fileUploadForm");
    const fileNameInput = document.getElementById("fileName");
    const fileInput = document.getElementById("uploaded_file");
    const fileUpError = document.getElementById("fileUpError");
    console.log(
      "fileUploadForm",
      fileUploadForm,
      "fileNameInput",
      fileNameInput,
      "fileInput",
      fileInput,
      "fileUpError",
      fileUpError
    );
    if (!fileUploadForm || !fileNameInput || !fileInput || !fileUpError) {
      throw new Error("One or more elements not found");
    }

    console.log("JS LOADED");
    fileUploadForm.addEventListener("submit", (event) => {
      console.log("file submitted AAA");
      let hasError = false;

      if (!fileNameInput.value.trim()) {
        hasError = true;
      }

      if (!fileInput.files.length) {
        hasError = true;
      }

      if (hasError) {
        console.log("hasError", hasError);
        event.preventDefault();
        fileUpError.style.display = "block";
      } else {
        console.log("no error");
        fileUpError.style.display = "none";
      }
    });
  } catch (error) {
    console.error("Error initializing form validation:", error);
  }

  document.querySelectorAll(".deleteFileButton").forEach((button) => {
    button.addEventListener("click", (event) => {
      const fileId = button.getAttribute("data-file-id");
      const confirmDelete = button.nextElementSibling;
      button.style.display = "none";
      confirmDelete.style.display = "block";
    });
  });

  document.querySelectorAll(".confirmCancel").forEach((button) => {
    button.addEventListener("click", (event) => {
      const confirmDelete = button.parentElement;
      const deleteButton = confirmDelete.previousElementSibling;
      confirmDelete.style.display = "none";
      deleteButton.style.display = "block";
    });
  });

  document.querySelectorAll(".confirmYes").forEach((button) => {
    button.addEventListener("click", async (event) => {
      console.log("confirm delete fires on click");
      const fileId = button.getAttribute("data-file-id");
      try {
        const response = await fetch(`/delete-file/${fileId}`, {
          method: "DELETE",
        });
        console.log("response:", response);

        if (!response.ok) {
          throw new Error("Failed to delete file");
        }

        const result = await response.json();
        console.log("File deleted:", result);

        // Remove the file from the DOM
        const fileElement = button.closest(".file");
        fileElement.remove();
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    });
  });

  // Example usage of FileSaver
  document.querySelectorAll(".downloadButton").forEach((button) => {
    button.addEventListener("click", async (event) => {
      console.log("File Save js in")
      const fileLink = button.getAttribute("data-file-link"); 
      const fileName = button.getAttribute("data-file-name");
      try {
        saveAs(fileLink, fileName);
      } catch (error) {
        console.error("Error downloading file:", error);
      };
  })});
});
