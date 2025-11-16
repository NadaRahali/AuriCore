FROM python:3.10-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libgomp1 \
    libgcc-12-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy ONLY needed files explicitly to guarantee they are included
COPY requirements.txt .
COPY app.py .
COPY inference.py .
COPY firebase_client.py .
COPY personalization.py .
COPY features.py .
COPY models/ models/
COPY data/ data/

RUN pip install --no-cache-dir -r requirements.txt

ENV PORT=8080

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
