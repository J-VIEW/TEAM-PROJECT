document.addEventListener("DOMContentLoaded", function () {
  // Your modal.js code here...

  function closeModal() {
    document.getElementById("mymodal").style.display = "none";
  }

  let index = 0;
  displayImages();

  function displayImages() {
    const images = document.getElementsByClassName("image");
    for (let i = 0; i < images.length; i++) {
      images[i].classList.remove("show");
    }
    index++;
    if (index > images.length) {
      index = 1;
    }
    images[index - 1].style.right = "0";
    images[index - 1].classList.add("show");

    // Prepare next image
    const nextIndex = index < images.length ? index : 0;
    images[nextIndex].style.right = "100%";

    setTimeout(displayImages, 4000);
  }

  //signup/login

  function openModal() {
    document.getElementById("mymodal").style.display = "block";
  }

  function closeModal() {
    document.getElementById("mymodal").style.display = "none";
  }

  // Get the button that opens the modal
  let btn = document.getElementById("mybtn");

  // Get the buttons that close the modal
  let signInBtn = document.getElementById("signInBtn");
  let signUpBtn = document.getElementById("signUpBtn");

  // When the user clicks on the button, open the modal
  btn.onclick = function () {
    openModal();
  };

  // When the user clicks on "Sign In" or "Sign Up", close the modal
  signInBtn.onclick = function () {
    closeModal();
  };
  signUpBtn.onclick = function () {
    closeModal();
  };
});
