
let topBtn = document.querySelector("#topBtn");


window.addEventListener("scroll", function() {

    if (window.scrollY > 100) {
        topBtn.classList.add("show");
    }
    else {
        topBtn.classList.remove("show");
    }

});


topBtn.addEventListener("click", function() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});