# ResolveDesk

Customer-support portal for e-commerce, built from scratch with Django REST Framework and React/Vite.

## Start the API

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Start the React app

```powershell
cd frontend
npm install
npm run dev
```

The API is exposed at `http://127.0.0.1:8000/api/tickets/`. The UI includes a demo fallback until the API is running, then uses the live endpoint for ticket creation.
