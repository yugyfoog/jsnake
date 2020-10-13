# JSnake

# The server version

To build:
docker build -t jsnake .

To Run:
docker run -it --rm -d -p 8080:80 jsnake
# container hash appears here

Browse to http://localhost:8080/snake.html

To stop server
docker stop <container hash>
