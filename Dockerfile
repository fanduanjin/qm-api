FROM node
RUN mkdir -p /usr/src/qm-api
WORKDIR /usr/src/qm-api
COPY ./ /usr/src/qm-api/
RUN npm install /usr/src/qm-api


EXPOSE 3000

CMD node app.js
