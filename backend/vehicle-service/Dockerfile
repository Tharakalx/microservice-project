# FROM maven:3.8.1-openjdk-21 AS build
# WORKDIR /app
# COPY pom.xml .
# # Copy the source code
# COPY src ./src
# # Build the application into a JAR file
# RUN mvn clean package -DskipTests

# FROM openjdk:17-alpine
# WORKDIR /app
# COPY --from=build /app/target/*.jar app.jar
# EXPOSE 5051
# ENTRYPOINT ["java", "-jar", "app.jar"]
# ---------- Build stage ----------
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# ---------- Runtime stage ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 5051
ENTRYPOINT ["java","-jar","app.jar"]
