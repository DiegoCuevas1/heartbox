#!/bin/sh
set -e

# Apply database migrations before starting. Safe to run on every boot.
python manage.py migrate --noinput

exec "$@"
