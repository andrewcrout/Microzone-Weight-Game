#!/bin/sh
set -eu

certbot renew --webroot -w /var/www/certbot
nginx -s reload
