# BlogSphere - Premium Full-Stack Blogging Platform

BlogSphere is a production-quality, full-stack blogging platform resembling Dev.to or Medium. It features dual user roles (Admin and Customer Author), markdown rendering, reading time estimators, likes/bookmarks interactions, inline comments CRUD, sharing utilities, and an analytical dashboard.

---

## Technical Stack
- **Frontend**: React.js (Vite), Tailwind CSS v4, Axios, React Router DOM, Lucide Icons.
- **Backend**: Django, Django REST Framework, SimpleJWT.
- **Database**: SQLite (pre-seeded with 8 categories, 5 users, 22 posts, and 55 comments).

---

## Folder Structure
```
Blog/
├── backend/
│   ├── accounts/          # User Profiles and Registration Views
│   ├── posts/             # Categories, Posts, Likes, Bookmarks Views
│   ├── comments/          # Blog Comments Views
│   ├── backend/           # Core Project Configurations (settings, urls)
│   ├── db.sqlite3         # SQLite Database file
│   ├── seed_db.py         # Database Seeding script
│   └── requirements.txt   # Python Dependencies
└── frontend/
    ├── public/            # Static assets
    ├── src/
    │   ├── assets/        # Visual icons & templates
    │   ├── components/    # Common UI widgets (Navbar, Cards, Modals)
    │   ├── context/       # Auth and Toast Providers
    │   ├── pages/         # Page Views (Home, Blogs, Dashboards)
    │   ├── services/      # Axios Interceptor client
    │   ├── App.jsx        # Routing Table configuration
    │   ├── main.jsx       # Root Mounting wrapper
    │   └── index.css      # Core Stylesheet & Animations
    ├── vite.config.js     # Compiler configurations
    └── package.json       # Node dependencies
```

---

## Features Implemented

### 🛡️ Authentication & Authorization
- Secure JWT-based login, registration, and refresh routines.
- Client role checks fetch data dynamically from `GET /api/profile/` (`is_staff` determines Admin, otherwise Customer/Author).
- Private routes are protected. Authors can only edit/delete their own creations. Admins can delete any blog or comment.

### ✍️ Author & Content Workspace
- **Create & Edit Blog**: Markdown editor preview support, summary text, category dropdowns, local file image uploads, or fallbacks to Image URLs.
- **My Workspace**: Displays a visible draft/published status badge, publish/unpublish toggle buttons, and search/filter.
- **Blog Cards**: Zoom images on hover, category indicators, estimated reading time counters, comments count, and bookmarking/sharing icons.
- **Blog Details**: Rich Markdown formatting parser, author bio snippets, and a carousel list of related posts from the same category.
- **Author Profiles**: Displays author biographies, metrics, and a listing of published posts.

### 💬 Social Interactions
- **Like System**: Toggle likes on cards and details.
- **Comment Section**: Add comments, inline editing, and deletion confirmation modal alerts. Lists comments in chronological order (newest first) with "Edited" badges.
- **Bookmarks**: Save posts for later reading, accessible on the "Bookmarks" page.
- **Sharing**: One-click sharing copies the blog post link directly to the clipboard.

### 📊 Administrative Dashboard
- Analytics metrics count Total Users, Total Blogs, Published/Draft counts, and Comments.
- Inline Category CRUD (Create, Edit, Delete). Category deletions are blocked if there are active posts.
- Leaderboard trackers for most active authors, recent registrations, recent comments, and recent posts.

---

## Test Accounts & Credentials

- **Admin Account**:
  - Email/Username: `admin@blogsphere.com`
  - Password: `admin123`
- **Customer Author Account**:
  - Email/Username: `author1@blogsphere.com`
  - Password: `author123`

---

## Installation & How to Run

### 1. Backend Setup (Django)
Navigate to the `backend/` directory:
```bash
cd backend
```

Create and activate a virtual environment:
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

Install requirements:
```bash
pip install -r requirements.txt
```

Apply migrations and seed the database:
```bash
python manage.py migrate
python seed_db.py
```

Run server:
```bash
python manage.py runserver 127.0.0.1:8000
```

---

### 2. Frontend Setup (React)
Navigate to the `frontend/` directory:
```bash
cd ../frontend
```

Install packages:
```bash
npm install
```

Start the Vite dev server:
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.
