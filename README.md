# 📝 TodoList Project

A simple **Node.js + Express + PostgreSQL** based Todo List application.  
It allows users to:
- Add and delete users
- Assign tasks with deadlines (daily, weekly, monthly)
- Manage tasks per user
  
  ## 🛠️ Tech Stack

- [Node.js](https://nodejs.org/)  
- [Express](https://expressjs.com/)  
- [PostgreSQL](https://www.postgresql.org/)  
- [EJS](https://ejs.co/)  
- [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)  

---

## 🚀 Features
- User management (add/delete users)
- Task management with deadlines
- Dynamic views using **EJS**
- Styled with custom CSS
- PostgreSQL database integration
- Environment variables for secure database connection

---

## 📂 Project Structure
├── public/ # Static files (CSS, images, etc.)
│ └── styles/
│ └── main.css
├── views/ # EJS templates
│ ├── index.ejs
│ ├── new.ejs
│ └── partials/
│ ├── header.ejs
│ └── footer.ejs
├── index.js # Main Express app
├── queries.sql # SQL schema and queries
├── package.json
├── .env # Environment variables (not tracked in git)
└── README.md


---

## ⚙️ Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

npm install

Create a .env file in the project root
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=todolist
DB_PASSWORD=your_password
DB_PORT=5432

CREATE DATABASE todolist

inside the database in postgresql create two tables users and todo, users is for keeping the track of current users while todo is used for tracking tasks.

CREATE TABLE users(
  id integer SERIAL PRIMARY KEY,
  name varchar(100) not null,
  color varchar(50) not null
) 

=


