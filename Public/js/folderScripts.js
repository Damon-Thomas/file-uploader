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
        fileUpError.style.visibility = "visible";
      } else {
        console.log("no error");
        fileUpError.style.visibility = "hidden";
      }
    });
  } catch (error) {
    console.error("Error initializing form validation:", error);
  }

  //download file
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

  // Copy link to clipboard
  document.querySelectorAll(".copyLinkButton").forEach((button) => {
    button.addEventListener("click", (event) => {
      
      const fileLink = button.getAttribute("data-file-link");
      const fileId = button.getAttribute("data-file-id")
      const message = document.querySelector(`.hiddenNotice[data-file-id="${fileId}"]`)
      console.log('Message!!!', message)
      message.style.display = "block";
      
      navigator.clipboard.writeText(fileLink).then(() => {
        console.log("Link copied to clipboard:", fileLink);
      }).catch((error) => {
        console.error("Error copying link to clipboard:", error);
      });
    });
  });

  //modal
  document.querySelectorAll('.deleteFileButton').forEach(button => {
    button.addEventListener('click', () => {
        const fileId = button.getAttribute('data-file-id');
        document.getElementById(`deleteModal-${fileId}`).style.display = 'flex';
    });
  });

  document.querySelectorAll('.confirmCancel').forEach(button => {
    button.addEventListener('click', () => {
        button.closest('.modal').style.display = 'none';
    });
  });

  document.querySelectorAll('.confirmYes').forEach(button => {
    button.addEventListener('click', async () => {
        const fileId = button.getAttribute('data-file-id');
        try {
            const response = await fetch(`/delete-file/${fileId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete file');
            }

            const result = await response.json();
            console.log('File deleted:', result);

            // Remove the file from the DOM
            const fileElement = button.closest('.file');
            fileElement.remove();
            button.closest('.modal').style.display = 'none';
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    });
  });








  // Add event listener for confirmYes button if needed
  // document.querySelectorAll('.confirmYes').forEach(button => {
  //     button.addEventListener('click', () => {
  //         // Handle the delete confirmation
  //     });
  // });

});
