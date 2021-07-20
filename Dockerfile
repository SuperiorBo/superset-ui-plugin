FROM node:14

EXPOSE 6006

VOLUME /home/superset-ui-plugin

WORKDIR /home/superset-ui-plugin

ENTRYPOINT ["sh","./entrypoint.sh"]