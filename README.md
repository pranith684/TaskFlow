# TaskFlow - A Full-Stack MERN To-Do Application

TaskFlow is a modern, professional, and feature-rich to-do list application built with the MERN stack (MongoDB, Express.js, React, Node.js). It provides a complete user authentication system and a beautiful, intuitive interface for managing daily tasks.

![TaskFlow Tasks Page](https://i.imgur.com/your-tasks-page-image.png) ---

## Features

-   **User Authentication:** Secure user registration and login system using JWT (JSON Web Tokens).
-   **CRUD Functionality:** Full Create, Read, Update, and Delete capabilities for tasks.
-   **Professional UI/UX:** A modern, card-based interface with smooth animations and transitions.
-   **Dashboard with Analytics:** A visual dashboard displaying key statistics like total, completed, and pending tasks.
-   **Task Management:**
    -   Filter tasks by status (All, Pending, In Progress, Completed).
    -   Search for specific tasks by name.
-   **User Profile Management:** A dedicated profile page to view user details and securely change passwords.
-   **Dark & Light Themes:** A theme toggle switch in the navbar allows users to choose their preferred visual mode, with the choice saved locally.
-   **Responsive Design:** The application is fully responsive and works beautifully on all devices.
-   **Toast Notifications:** Professional, non-disruptive notifications for all user actions.

---

## Technologies Used

-   **Frontend:** React, React Router, Axios, Framer Motion (for animations), Lottie (for animations), React Toastify.
-   **Backend:** Node.js, Express.js.
-   **Database:** MongoDB (with Mongoose).
-   **Authentication:** JWT, bcrypt.js (for password hashing).

---

## How to Run This Project Locally

To run this project on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/pranith684/taskflow.git](https://github.com/pranith684/taskflow.git)
    cd taskflow
    ```
2.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    ```
3.  **Install Frontend Dependencies:**
    ```bash
    cd frontend
    npm install
    ```
4.  **Set Up Environment Variables:**
    -   In the `backend` folder, create a `.env` file.
    -   Add your MongoDB connection string and a JWT secret key:
        ```
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_super_secret_key
        ```
5.  **Build the Frontend:**
    -   While still in the `frontend` directory, run the build command:
        ```bash
        npm run build
        ```
6.  **Run the Server:**
    -   Navigate back to the `backend` directory.
    -   Start the server:
        ```bash
        node server.js
        ```
    -   The application will be available at `http://localhost:3001` (or your specified port).

---

## Deployment

This application is configured for easy deployment on platforms like Render or Heroku. The Node.js server is set up to serve both the API and the static frontend build files.
