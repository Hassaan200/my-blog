import {
  auth,
  getAuth,
  createUserWithEmailAndPassword,
  doc,
  setDoc,
  getDoc,
  db,
  sendEmailVerification,
  signInWithEmailAndPassword,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  sendPasswordResetEmail,
  reauthenticateWithCredential, 
  updatePassword,
  EmailAuthProvider
} from "./firebase.js";

const signUpBtn = document.getElementById("signUpBtn");
const loginBtn = document.getElementById("loginBtn");
const signOut = document.getElementById("signOut");
const blogBtn = document.getElementById("add-blog");
const updateBtn = document.getElementById("edit-blog");
const forgetBtn = document.getElementById("forget-btn");

const resetBtn = document.getElementById("resetbtn");

const email = document.getElementById("email");
const password = document.getElementById("password");
const fullName = document.getElementById("fullName");
const title = document.getElementById("title");
const forgetEmail = document.getElementById("forget-email");
const description = document.getElementById("description");
const titleInput = document.getElementById("edit-title"); // Get the title input
const descriptionInput = document.getElementById("edit-description");
const loader = document.getElementById("loader");

const blogPage = document.getElementById("blog-data");
const picture = document.getElementById("pic");
const headerName = document.getElementById("header-name");

const oldPassword = document.getElementById("old-password");
const newPassword = document.getElementById("new-password");
const confirmPassword = document.getElementById("confirm-password");

const modal = document.getElementById("edit-modal");
const forgetModal = document.getElementById("static-modal");

const uid = localStorage.getItem("uid");
const date = new Date();
// regix

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//Password must contain one digit from 1 to 9, one lowercase letter, one uppercase letter, one special character, no space, and it must be 8-16 characters long.

const passwordRegex =
  /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;

const toastFunction = (msg, state, duration) => {
  Toastify({
    text: msg,
    className: "info",
    duration: duration ? duration : 3000,
    style: {
      background:
        state?.toLowerCase() == "error"
          ? "red"
          : "linear-gradient(to right, #00b09b, #96c93d)",
    },
  }).showToast();
};

const ReqFields = (title, description, btnId) => {
  const btn = document.getElementById(btnId);
  if (title != "" && description.length >= 120) {
    btn.classList.remove("pointer-events-none", "opacity-50");
    return true;
  } else {
    toastFunction(
      "Title must be required and description must have minimum 120 words",
      "error"
    );
    btn.classList.remove("pointer-events-none", "opacity-50");
    return false;
  }
};
const TimeConvertion = (timestampSeconds, timestampNanoseconds) => {
  const date = new Date(timestampSeconds * 1000);
  const nanoseconds = timestampNanoseconds / 1000000;
  date.setMilliseconds(date.getMilliseconds() + nanoseconds);
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const formattedDate = date.toLocaleDateString("en-GB", options);
  return formattedDate;
};
signUpBtn?.addEventListener("click", (e) => {
  e.preventDefault();

  if (email.value != "" && password.value != "" && fullName.value != "") {
    if (!emailRegex.test(email.value)) {
      toastFunction("email should be valid format", "error");
    } else if (!passwordRegex.test(password.value)) {
      toastFunction(
        "Password must contain one digit from 1 to 9, one lowercase letter, one uppercase letter, one special character, no space, and it must be 8-16 characters long",
        "error",
        4000
      );
    } else {
      createUserWithEmailAndPassword(auth, email.value, password.value)
        .then(async (userCredential) => {
          // Signed up
          const user = userCredential.user;
          // ...
          try {
            await setDoc(doc(db, "users", user.uid), {
              fullName: fullName.value,
              email: email.value,
            });
          } catch (e) {
            console.log(e);
          }

          sendEmailVerification(user).then(() => {
            // Email verification sent!
            // ...
            
            console.log("Email verification send");
            window.location.href = "/index.html";
            toastFunction(`Email verifcation link send to your ${user.email} id`);
          });
          console.log(user);
          
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          // ..
          console.log(error);
        });
    }
  } else {
    toastFunction("Enter required field", "Error");
  }
});

loginBtn?.addEventListener("click", (e) => {
  e.preventDefault();

  signInWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      // ...
      if (user.emailVerified) {
        window.location.href = "./blog.html";
        localStorage.setItem("uid", user.uid);
      } 
      
      else {
        sendEmailVerification(user).then(() => {
          toastFunction(`Email verifcation link send to your ${user.email} id`);
        });
      }
      console.log(user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(error);

      if (errorCode === "auth/wrong-password" || errorCode === "auth/invalid-credential") {
        toastFunction("Wrong password", "Error");
    } else if (errorCode === "auth/user-not-found") {
        toastFunction("No account found with this email", "Error");
    } else if (errorCode === "auth/invalid-email") {
        toastFunction("Invalid email format", "Error");
    } else {
        toastFunction(errorMessage, "Error");
    }
    });
  // console.log(email.value, password.value);
});

signOut?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "/";
});

// blogPage?.addEventListener('load', function(){ alert(42) } )

const route = ["/index.html", "/signup.html"];
const currentRoute = window.location.pathname;

// console.log(route.includes('/index.html'))

if (uid && route.includes(currentRoute)) {
  window.location.href = "/blog.html";
} else if (!uid && !route.includes(currentRoute)) {
  window.location.href = "/index.html";
}

if (uid) {
  const docRef = doc(db, "users", uid);

  try {
    const docSnap = await getDoc(docRef);
    const querySnapshot = await getDocs(collection(db, "blogs"));
    querySnapshot.forEach(async (document) => {
      // doc.data() is never undefined for query doc snapshots
      const blogData = document.data();
      const docRef1 = doc(db, "users", blogData.uid);
      const docSnap = await getDoc(docRef1);
      // console.log(blogData.timeZone.nanoseconds);
      if (docSnap.exists()) {
        const userData = docSnap.data();

        blogPage.innerHTML += `
        <div class="lg:mx-10 lg:my-6 m-4">
          <div class="w-full p-4 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <div class="w-full">
              <div class="flex gap-2 items-center">
                <div class="relative inline-flex items-center justify-center w-14 h-14 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                  <span class="font-medium text-gray-600 dark:text-gray-300">${userData.fullName
                    .slice(0,2)
                    .toUpperCase()}</span>
                </div>
                <div>
                  <h5 class="text-xl leading-none font-medium text-gray-900 dark:text-white">
                    ${userData.fullName.charAt(0).toUpperCase() + userData.fullName.slice(1)}
                  </h5>
                  <span class="text-sm text-gray-500 dark:text-gray-400">${
                    userData.email
                  }</span> 
                </div>
              </div>
    
              <div class="mt-4">
                <p class="font-bold text-2xl text-white">${blogData.title}</p>
                <p class="text-sm lg:text-lg mt-2 text-justify text-white">${
                  blogData.description
                }</p>
                <p class="text-sm lg:text-lg mt-2 text-justify font-bold text-white">
                  ${TimeConvertion(
                    blogData.timeZone.seconds,
                    blogData.timeZone.nanoseconds
                  )}
                </p>
              </div>
              ${
                uid === blogData.uid
                  ? `
                <div class="mt-4">
                  <button class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                    onclick="DeleteBlog('${document.id}')">
                    Delete
                  </button>
                  <button class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                    onclick="EditBlog('${document.id}', '${blogData.title}', '${blogData.description}')">
                    Edit
                  </button>
                </div>
              `
                  : ""
              }
             
            </div>
          </div>
        </div>`;

        loader.style.display = "none";
      }
    });
    if (docSnap.exists()) {
      const data = docSnap.data();
      headerName.innerHTML = data.fullName.charAt(0).toUpperCase() + data.fullName.slice(1);
      picture.innerHTML = data.fullName.slice(0, 2).toUpperCase();
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  } catch (err) {
    console.log(err);
  }
}

blogBtn?.addEventListener("click", async (e) => {
  e.preventDefault();
  blogBtn.classList.add("pointer-events-none", "opacity-50");
  if (title.value != "" && description.value.length >= 120) {
    const docRef = await addDoc(collection(db, "blogs"), {
      title: title.value,
      description: description.value,
      uid,
      timeZone: date,
    });
    toastFunction(`Document written with ID: ${docRef.id}`);
    blogBtn.classList.remove("pointer-events-none", "opacity-50");
    window.location.reload()
  } else {
    toastFunction(
      "Title must be required and description must have minimum 120 words",
      "error"
    );
    blogBtn.classList.remove("pointer-events-none", "opacity-50");
  }
});

const DeleteBlog = async (id) => {
  try {
    await deleteDoc(doc(db, "blogs", id));
    window.location.reload();
  } catch (err) {
    toastFunction(err.message, "error");
  }
};

let blogId = "";

const EditBlog = (id, title, description) => {
  blogId = id;

  if (modal) {
    modal.classList.replace("hidden", "flex");
    titleInput.value = title;
    descriptionInput.value = description;
  }
};

updateBtn?.addEventListener("click", async (e) => {
  e.preventDefault();
  const updateRef = doc(db, "blogs", blogId);
  const validation = ReqFields(
    titleInput.value,
    descriptionInput.value,
    "edit-blog"
  );

  if (validation) {
    try {
      await updateDoc(updateRef, {
        title: titleInput.value,
        description: descriptionInput.value,
      });
      window.location.reload();
    } catch (err) {
      toastFunction(err.message, "error");
    }
  }
});

forgetBtn?.addEventListener("click", async (e) => {
  e.preventDefault();
  if (emailRegex.test(forgetEmail.value)) {
    sendPasswordResetEmail(auth, forgetEmail.value)
      .then(() => {
        // Password reset email sent!
        // ..
        forgetModal.classList.replace("flex", "hidden");
        toastFunction(`Email send to ${forgetEmail.value}`);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
        toastFunction(errorMessage, "Error");
      });
  } else {
    toastFunction("Enter required field", "Error");
  }
});
window.DeleteBlog = DeleteBlog;
window.EditBlog = EditBlog;


resetBtn?.addEventListener("click", async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    toastFunction("No user is logged in. Please log in first.", "Error");
    return;
  }

  
  

  
  if (newPassword.value !== confirmPassword.value) {
    toastFunction("New password and confirm password do not match!", "Error");
    return;
  }

  try {
     // Re-authenticate user before updating password
     const credential = EmailAuthProvider.credential(user.email, oldPassword.value);
     await reauthenticateWithCredential(user, credential);

    await updatePassword(user, newPassword.value);
    toastFunction("Password updated successfully!", "Success");
    document.getElementById("resetPasswordModal").classList.add("hidden");
    window.location.reload()
  } 
  catch (error) {
    console.error("Error updating password:", error.message);
    if (error.code === "auth/wrong-password") {
      toastFunction("Incorrect old password!", "Error");
    } else if (error.code === "auth/too-many-requests") {
      toastFunction("Too many failed attempts. Try again later.", "Error");
    } else {
      toastFunction("Error updating password. Try again.", "Error");
    }
  }
});