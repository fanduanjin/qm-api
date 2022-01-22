FROM node
RUN mkdir -p /usr/src/qm-api
WORKDIR /usr/src/qm-api
COPY package.json /usr/src/qm-api/
RUN npm install /usr/src/qm-api
COPY ./api/ /usr/src/qm-api/
COPY ./util/ /usr/src/qm-api/
COPY ./model/ /usr/src/qm-api/
COPY ./app.js /usr/src/qm-api/

EXPOSE 3000

CMD node app.js
