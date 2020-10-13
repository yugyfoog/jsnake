FROM nginx
COPY ./snake.html /usr/share/nginx/html/snake.html
COPY ./css /usr/share/nginx/html/css
COPY ./script /usr/share/nginx/html/script
