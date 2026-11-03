
/* Profile Card Elements */

let profileCard = document.querySelector("#profileCard");

let addBtn = document.querySelector("#addBtn");

let removeBtn = document.querySelector("#removeBtn");

let toggleBtn = document.querySelector("#toggleBtn");

let heading = document.querySelector("#heading");

let description = document.querySelector("#description");


/* Add Style Button */

addBtn.addEventListener("click", function() {

    profileCard.classList.add("highlight");

});


/* Remove Style Button */

removeBtn.addEventListener("click", function() {

    profileCard.classList.remove("highlight");

});


/* Toggle Style Button */

toggleBtn.addEventListener("click", function() {

    profileCard.classList.toggle("highlight");

});


/* Marks Checker Elements */

let marksInput = document.querySelector("#marksInput");

let checkBtn = document.querySelector("#checkBtn");

let result = document.querySelector("#result");


/* Marks Checker */

checkBtn.addEventListener("click", function() {

    let marks = Number(marksInput.value);

    if (marksInput.value === "") {

        result.textContent = "Please enter your marks.";

    }

    else if (marks < 0) {

        result.textContent = "Marks cannot be less than 0.";

    }

    else if (marks > 100) {

        result.textContent = "Marks cannot be greater than 100.";

    }

    else if (marks >= 90) {

        result.textContent = "Grade A+ - Excellent!";

    }

    else if (marks >= 80) {

        result.textContent = "Grade A - Very Good!";

    }

    else if (marks >= 70) {

        result.textContent = "Grade B - Good!";

    }

    else if (marks >= 60) {

        result.textContent = "Grade C - Keep Practicing!";

    }

    else if (marks >= 50) {

        result.textContent = "Grade D - Need Improvement!";

    }

    else {

        result.textContent = "Fail - Try Again!";

    }

});


/* Data Type Checker Elements */

let dataBtn = document.querySelector("#dataBtn");

let dataResult = document.querySelector("#dataResult");


/* Data Type Checker */

dataBtn.addEventListener("click", function() {

    const studentName = "Huzaifa";

    const studentAge = 17;

    const isStudent = true;

    dataResult.textContent =

        "Student Name: " + typeof studentName + "\n" +

        "Student Age: " + typeof studentAge + "\n" +

        "Is Student: " + typeof isStudent;

});
