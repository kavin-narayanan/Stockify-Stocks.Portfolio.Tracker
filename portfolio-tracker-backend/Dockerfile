# Use Maven to build JAR first (Multi-stage build)
FROM maven:3.8.6-openjdk-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Use OpenJDK as the base image
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy the built JAR from the Maven stage
COPY --from=builder /app/target/portfolio-tracker-backend-0.0.1-SNAPSHOT.jar /app/app.jar

# Expose the port the app will run on
EXPOSE 8080

# Run the JAR file
CMD ["java", "-jar", "/app/app.jar"]
