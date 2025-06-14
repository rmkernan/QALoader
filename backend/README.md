# Q&A Loader Backend

FastAPI backend for the Q&A Loader application.

## Setup

1. Create virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment:
   - Copy `.env.example` to `.env`
   - Update with your Supabase credentials

4. Run the server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## API Documentation

Once running, visit http://localhost:8000/docs for interactive API documentation.

## Project Structure

```
backend/
   app/
      main.py              # FastAPI app entry point
      config.py            # Environment/database config
      database.py          # Supabase connection
      models/              # Data models
      routers/             # API route handlers
      services/            # Business logic
      utils/               # Utility functions
   requirements.txt         # Python dependencies
```