FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential \
  libcairo2 \
  libffi-dev \
  libgdk-pixbuf-2.0-0 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libpangoft2-1.0-0 \
  libharfbuzz0b \
  libjpeg62-turbo \
  libopenjp2-7 \
  liblcms2-2 \
  libwebp7 \
  libtiff6 \
  shared-mime-info \
  fonts-dejavu-core \
  wget \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8010

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8010"]
