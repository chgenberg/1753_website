FROM php:8.1-cli

# Set working directory
WORKDIR /app

# Copy PHP files
COPY . .

# Expose default port (Railway sätter PORT dynamiskt ändå)
EXPOSE 8080

# Start PHP built-in server och bind till $PORT
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8080} index.php"] 