# Masonry Estimator

Masonry Estimator is a web application for managing masonry project estimates and material totals.

## Features

- Account registration and sign in
- Project list per signed-in user
- Estimate item entry for material and labor costs
- Automatic project totals
- Material summary grouped by category
- Materials CSV export

## Run Locally

```powershell
cd D:\Software\MasonryEstimation\MasonryEstimation
dotnet run
```

Then open the local URL printed by ASP.NET.

## Deploy From GitHub

This app needs an ASP.NET Core server, so GitHub Pages will not run it. A free demo deployment can be done with Render using the included `Dockerfile`.

1. Create an empty GitHub repository.
2. Push this project:

```powershell
cd D:\Software\MasonryEstimation
git init
git add .
git commit -m "Initial Masonry Estimator app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/MasonryEstimation.git
git push -u origin main
```

3. In Render, create a new Web Service.
4. Connect the GitHub repository.
5. Use Docker as the runtime.
6. Select the free plan and deploy.

The free plan is good for a portfolio demo. The app can sleep after inactivity, and SQLite data on free hosting should be treated as temporary demo data.

## API Endpoints

- `GET /api/projects`
- `GET /api/projects/{id}`
- `POST /api/projects`
- `POST /api/projects/{projectId}/items`
- `DELETE /api/projects/{projectId}/items/{itemId}`
- `DELETE /api/projects/{id}`
- `GET /api/projects/{id}/materials.csv`

## Notes

The application uses SQLite for local storage and ASP.NET Core Identity for authentication. The local database is stored under the signed-in Windows user's application data folder.
