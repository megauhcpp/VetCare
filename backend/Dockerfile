FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nginx

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy existing application directory
COPY . .

# Install dependencies
RUN composer install

# Generate key
RUN php artisan key:generate

# Configure nginx
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Change ownership of our applications
RUN chown -R www-data:www-data /var/www/html

# Expose port 8000 and start nginx and php-fpm
EXPOSE 8000
CMD service nginx start && php-fpm 