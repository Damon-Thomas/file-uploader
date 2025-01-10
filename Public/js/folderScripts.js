document.addEventListener("DOMContentLoaded", () => {
  try {
    const fileUploadForm = document.getElementById('fileUploadForm');
    const fileNameInput = document.getElementById('fileName');
    const fileInput = document.getElementById('uploadedFile');
    const fileUpError = document.getElementById('fileUpError');

    if (!fileUploadForm || !fileNameInput || !fileInput || !fileUpError) {
      throw new Error('One or more elements not found');
    }

    console.log('JS LOADED');
    fileUploadForm.addEventListener('submit', (event) => {
      console.log('file submitted');
      let hasError = false;

      if (!fileNameInput.value.trim()) {
        hasError = true;
      }

      if (!fileInput.files.length) {
        hasError = true;
      }

      if (hasError) {
        console.log('hasError', hasError);
        event.preventDefault();
        fileUpError.style.display = 'block';
      } else {
        console.log('no error');
        fileUpError.style.display = 'none';
      }
    });
  } catch (error) {
    console.error('Error initializing form validation:', error);
  }

  // Existing code for delete file functionality
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
});