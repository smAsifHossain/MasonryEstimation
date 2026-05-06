# Masonry Estimator

Masonry Estimator is a full-stack web application for creating masonry project bids, tracking material and labor costs, and exporting material summaries. It was built as a professional ASP.NET Core and React portfolio project focused on a real construction preconstruction workflow.

**Live Demo:** [https://masonryestimation.onrender.com](https://masonryestimation.onrender.com)

## Repository Structure

```text
MasonryEstimation/
├── MasonryEstimation/
│   ├── Controllers/
│   ├── Data/
│   ├── Models/
│   ├── Services/
│   ├── Views/
│   ├── wwwroot/
│   │   ├── css/
│   │   └── js/
│   ├── Program.cs
│   └── MasonryEstimation.csproj
├── Dockerfile
├── render.yaml
├── .dockerignore
├── .gitignore
└── README.md
```


## Screenshots

### Homepage

![Homepage](Screenshot%202026-05-05%20225638.png)

### Sign In

![Sign in](Screenshot%202026-05-05%20225432.png)

### Create Account

![Create account](Screenshot%202026-05-05%20225447.png)

### Dashboard

![Dashboard](Screenshot%202026-05-05%20225538.png)

## Project Overview

The application gives masonry estimators a secure workspace where they can create projects, add bid line items, review material and labor totals, group materials by category, and export material summaries for handoff or review.

The goal of the project is to demonstrate practical software engineering skills using a stack commonly found in professional business applications:

- Secure account registration and sign in
- Authenticated project dashboard
- CRUD-style project and bid item management
- Server-side data persistence with SQLite
- API-driven React dashboard interactions
- Responsive light/dark user interface
- Docker-based deployment to a live cloud environment

## Key Features

- **User authentication:** Account registration, sign in, sign out, remember-me support, and secure cookie-based sessions using ASP.NET Core Identity.
- **Project management:** Users can create and delete masonry projects with client, location, and bid due date details.
- **Estimate item tracking:** Each project can contain bid line items with area, description, quantity, unit, material unit cost, labor unit cost, and material category.
- **Automatic totals:** The dashboard calculates material totals, labor totals, project totals, and item-level totals dynamically.
- **Material summary:** Materials are grouped by category so estimators can quickly review quantities and costs.
- **CSV export:** Users can export material summaries for the selected project.
- **Modern UI:** Responsive layout, animated interface states, polished homepage, authentication pages, dashboard views, and light/dark mode.
- **Live deployment:** The application is containerized with Docker and deployed as a Render web service.

## Tech Stack

### Backend

- **ASP.NET Core 8** for the web application, MVC routing, controllers, and server-side views.
- **ASP.NET Core Identity** for authentication, password handling, user accounts, and cookie sessions.
- **Entity Framework Core** for database access and object-relational mapping.
- **SQLite** for lightweight relational data storage.

### Frontend

- **React** for the interactive dashboard experience.
- **Razor Views** for server-rendered pages such as homepage, login, and registration.
- **CSS** for the responsive visual system, animations, light mode, and dark mode.
- **JavaScript** for client-side behavior, theme persistence, dashboard actions, and API calls.

### Deployment

- **Docker** for a repeatable production build.
- **Render** for live hosting.
- **GitHub** for source control and deployment integration.

## How It Works

The application uses ASP.NET Core as the main server. Public pages such as the homepage, sign in, and registration are rendered through MVC/Razor views. After a user signs in, they are taken to the dashboard.

The dashboard is powered by React. React calls protected API endpoints to load projects, create projects, delete projects, add estimate items, remove estimate items, and export material summaries. The backend validates the signed-in user before returning or modifying any project data.

Data is stored through Entity Framework Core using SQLite. The main entities are users, projects, and estimate items. Each project belongs to a specific authenticated user, and each estimate item belongs to a project.

## Application Flow

1. A visitor opens the homepage.
2. The visitor creates an account or signs in.
3. The authenticated user opens the dashboard.
4. The user creates a masonry project with client, location, and bid date.
5. The user adds estimate items with quantities, units, material costs, labor costs, and categories.
6. The dashboard updates totals and material summaries.
7. The user can export the selected project's material summary as a CSV file.

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/projects` | Get projects for the signed-in user |
| `GET` | `/api/projects/{id}` | Get one project with estimate items |
| `POST` | `/api/projects` | Create a project |
| `DELETE` | `/api/projects/{id}` | Delete a project |
| `POST` | `/api/projects/{projectId}/items` | Add an estimate item |
| `DELETE` | `/api/projects/{projectId}/items/{itemId}` | Delete an estimate item |
| `GET` | `/api/projects/{id}/materials.csv` | Export material summary as CSV |

## Database

The application uses SQLite with Entity Framework Core. SQLite keeps the project easy to run locally without installing a separate database server.

Local database files are ignored by Git through `.gitignore`, so development data is not committed to the repository.

For the hosted Render demo, SQLite should be treated as temporary demo storage. Free hosting environments can restart or redeploy the app, which may reset local file-based data. For production use, the app could be moved to PostgreSQL, SQL Server, or another managed database.

## Developer

Built by **S M Asif Hossain**.

LinkedIn: [https://www.linkedin.com/in/smasifhossain/](https://www.linkedin.com/in/smasifhossain/)
