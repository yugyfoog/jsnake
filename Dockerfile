FROM node:14.14
EXPOSE 8000
COPY . .
CMD [ "node", "server.js", "8000" ]
