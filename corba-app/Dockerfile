FROM maven:3.9.15-eclipse-temurin-8-alpine AS build
WORKDIR /app
COPY Buffer.idl .
COPY corba-server/ ./corba-server/
COPY corba-client/ ./corba-client/
RUN mvn -f corba-server/pom.xml package -DskipTests -B -Dhttps.protocols=TLSv1.2 && \
    mvn -f corba-client/pom.xml package -DskipTests -B -Dhttps.protocols=TLSv1.2

FROM tomcat:9.0.20-jre8-alpine
WORKDIR /usr/local/tomcat
RUN rm -rf webapps/*
COPY --from=build /app/corba-server/target/*.jar ./app-server.jar
COPY --from=build /app/corba-client/target/*.war ./webapps/ROOT.war
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "\
    CLIENT_CORBA_PORT=${CLIENT_CORBA_PORT:-8080}; \
    ORB_CORBA_PORT=${ORB_CORBA_PORT:-1050}; \
    orbd -ORBInitialPort $ORB_CORBA_PORT -ORBInitialHost 127.0.0.1 & \
    while ! nc -z localhost $ORB_CORBA_PORT; do sleep 0.1; done; \
    java -cp app-server.jar ual.dwsc.server.BufferServer -ORBInitialPort $ORB_CORBA_PORT -ORBInitialHost 127.0.0.1 & \
    export CATALINA_OPTS=\"-Dorg.omg.CORBA.ORBInitialPort=$ORB_CORBA_PORT -Dorg.omg.CORBA.ORBInitialHost=127.0.0.1\"; \
    sed -i \"s/Connector port=\\\"8080\\\"/Connector port=\\\"$CLIENT_CORBA_PORT\\\"/g\" conf/server.xml; \
    exec catalina.sh run \
"]